import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessErrorCode } from './codes';

/**
 * Base class for application/domain rule violations raised by the
 * Application or Domain layers (e.g. invalid state transitions, ownership
 * checks). Infrastructure-level failures should use InfrastructureException
 * instead so the global exception filter can classify and log them differently.
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly code: BusinessErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}
