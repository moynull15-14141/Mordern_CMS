import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '../../core/logger/app-logger.service';
import { PerformanceLoggerService } from '../../core/logger/performance-logger.service';
import { RequestWithIds } from '../middleware/request-id.middleware';

/**
 * Request Logger: records one structured log line per completed request
 * (method, path, status, duration, request/correlation ids) in addition to
 * nestjs-pino's own access log, and feeds timing into PerformanceLoggerService
 * so slow requests are flagged.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: AppLoggerService,
    private readonly performanceLogger: PerformanceLoggerService,
  ) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest & RequestWithIds>();
    const response = context.switchToHttp().getResponse<FastifyReply>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        const label = `${request.method} ${request.url}`;

        this.logger.log(`${label} ${response.statusCode}`, {
          requestId: request.requestId,
          correlationId: request.correlationId,
          durationMs,
        });
        this.performanceLogger.record(label, durationMs, { requestId: request.requestId });
      }),
    );
  }
}
