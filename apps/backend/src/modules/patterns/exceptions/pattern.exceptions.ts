import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode } from '../../../core/exceptions/codes';

export class PatternNotFoundException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.NOT_FOUND, `Pattern "${id}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class PatternAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Pattern "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class PatternNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.RULE_VIOLATION, `Pattern "${id}" is not deleted.`, HttpStatus.CONFLICT);
  }
}

export class PatternAlreadyArchivedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Pattern "${id}" is already archived.`,
      HttpStatus.CONFLICT
    );
  }
}

export class PatternNotArchivedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Pattern "${id}" is not archived.`,
      HttpStatus.CONFLICT
    );
  }
}

export class PatternSlugConflictException extends BusinessException {
  constructor(slug: string) {
    super(
      BusinessErrorCode.CONFLICT,
      `A pattern with slug "${slug}" already exists.`,
      HttpStatus.CONFLICT
    );
  }
}
