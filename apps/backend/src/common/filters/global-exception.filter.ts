import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticationException } from '../../core/exceptions/authentication.exception';
import { BusinessException } from '../../core/exceptions/business.exception';
import {
  AuthenticationErrorCode,
  AuthorizationErrorCode,
  ErrorCode,
  SystemErrorCode,
  ValidationErrorCode,
  isSecurityRelevantCode,
} from '../../core/exceptions/codes';
import { InfrastructureException } from '../../core/exceptions/infrastructure.exception';
import { ErrorLoggerService } from '../../core/logger/error-logger.service';
import { SecurityLoggerService } from '../../core/logger/security-logger.service';
import { ApiErrorItem, buildErrorResponse } from '../../core/responses/api-response';
import { RequestWithIds } from '../middleware/request-id.middleware';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Single point of translation from any thrown value (HttpException,
 * BusinessException, InfrastructureException, or an unexpected error) into
 * the frozen { success: false, message, data: null, meta, errors } envelope
 * (docs/20_BACKEND_ARCHITECTURE.md §13). Every failure is logged once via
 * ErrorLoggerService, with authentication/authorization/rate-limit failures
 * additionally logged via SecurityLoggerService.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly errorLogger: ErrorLoggerService,
    private readonly securityLogger: SecurityLoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest & RequestWithIds>();

    const { status, error } = this.resolve(exception);

    this.errorLogger.logError(exception, {
      requestId: request.requestId,
      correlationId: request.correlationId,
      path: request.url,
      code: error.code,
    });

    if (isSecurityRelevantCode(String(error.code))) {
      this.securityLogger.record({
        event: String(error.code),
        requestId: request.requestId,
        correlationId: request.correlationId,
        path: request.url,
      });
    }

    response
      .status(status)
      .send(buildErrorResponse([error], { message: error.message, meta: { requestId: request.requestId } }));
  }

  private resolve(exception: unknown): { status: number; error: ApiErrorItem } {
    if (
      exception instanceof BusinessException ||
      exception instanceof InfrastructureException ||
      exception instanceof AuthenticationException
    ) {
      const body = exception.getResponse() as { code: ErrorCode; message: string; details?: unknown };
      return { status: exception.getStatus(), error: body };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const rawMessage =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ?? exception.message);

      return {
        status,
        error: {
          code: this.codeForStatus(status),
          message: Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage,
          details: typeof body === 'object' ? body : undefined,
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: {
        code: SystemErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
        details: !isProduction && exception instanceof Error ? { message: exception.message } : undefined,
      },
    };
  }

  private codeForStatus(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ValidationErrorCode.INVALID_INPUT;
      case HttpStatus.UNAUTHORIZED:
        return AuthenticationErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return AuthorizationErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return SystemErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return SystemErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return SystemErrorCode.RATE_LIMITED;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return SystemErrorCode.SERVICE_UNAVAILABLE;
      default:
        return SystemErrorCode.INTERNAL_ERROR;
    }
  }
}
