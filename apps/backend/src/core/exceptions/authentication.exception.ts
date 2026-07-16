import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthenticationErrorCode } from './codes';

/**
 * Base class for authentication failures (bad credentials, invalid/expired
 * token, inactive account) — the Identity module's counterpart to
 * BusinessException/InfrastructureException, kept distinct so the global
 * exception filter's security-relevant-code logging applies precisely.
 */
export class AuthenticationException extends HttpException {
  constructor(
    public readonly code: AuthenticationErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.UNAUTHORIZED,
    public readonly details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}
