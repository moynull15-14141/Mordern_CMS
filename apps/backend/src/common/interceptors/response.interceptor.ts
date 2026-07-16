import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { buildSuccessResponse } from '../../core/responses/api-response';
import { RequestWithIds } from '../middleware/request-id.middleware';

/**
 * Wraps every successful controller response in the frozen
 * { success: true, message, data, meta, errors: [] } envelope defined by the
 * API contract strategy in 20_BACKEND_ARCHITECTURE.md §13.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest & RequestWithIds>();

    return next.handle().pipe(
      map((data) => buildSuccessResponse(data, { meta: { requestId: request.requestId } })),
    );
  }
}
