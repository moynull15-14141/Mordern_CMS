import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode, ValidationErrorCode } from '../../../core/exceptions/codes';

export class PageNotFoundException extends BusinessException {
  constructor(idOrSlug: string) {
    super(BusinessErrorCode.NOT_FOUND, `Page "${idOrSlug}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class PageAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Page "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class PageNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.RULE_VIOLATION, `Page "${id}" is not deleted.`, HttpStatus.CONFLICT);
  }
}

export class PageSlugConflictException extends BusinessException {
  constructor(slug: string) {
    super(BusinessErrorCode.CONFLICT, `Slug "${slug}" is already in use.`, HttpStatus.CONFLICT);
  }
}

export class PageSlugValidationException extends HttpException {
  constructor(
    reason: string,
    public readonly code: ValidationErrorCode = ValidationErrorCode.INVALID_INPUT
  ) {
    super({ code, message: `Slug is invalid: ${reason}` }, HttpStatus.BAD_REQUEST);
  }
}

export class PageInvalidStatusTransitionException extends BusinessException {
  constructor(reason: string) {
    super(BusinessErrorCode.RULE_VIOLATION, reason, HttpStatus.BAD_REQUEST);
  }
}
