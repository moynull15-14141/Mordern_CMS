import { HttpException, HttpStatus } from '@nestjs/common';
import { InfrastructureErrorCode } from './codes';

/**
 * Base class for failures originating in the Infrastructure layer
 * (database, cache, queue, storage, external providers). Kept distinct from
 * BusinessException so logging/alerting can treat system failures differently
 * from expected domain rejections.
 */
export class InfrastructureException extends HttpException {
  constructor(
    message: string,
    public readonly originalError?: unknown,
    status: HttpStatus = HttpStatus.SERVICE_UNAVAILABLE,
    public readonly code: InfrastructureErrorCode = InfrastructureErrorCode.GENERIC,
  ) {
    super({ code, message }, status);
  }
}
