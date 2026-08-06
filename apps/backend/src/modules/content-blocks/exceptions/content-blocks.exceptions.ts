import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode } from '../../../core/exceptions/codes';

/** Mirrors `LayoutSlugValidationException`'s shape — one exception class
 * for every shape problem `BlockTreeValidator` can find, the reason string
 * carries the specifics (same pattern `ArticlesValidator`'s slug/date
 * exceptions already use). */
export class InvalidBlockTreeException extends BusinessException {
  constructor(reason: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Invalid content body: ${reason}`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class ReusableBlockNotFoundException extends BusinessException {
  constructor(idOrName: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Reusable block "${idOrName}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class ReusableBlockAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Reusable block "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class ReusableBlockNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Reusable block "${id}" is not deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class ReusableBlockNameConflictException extends BusinessException {
  constructor(name: string) {
    super(
      BusinessErrorCode.CONFLICT,
      `A reusable block named "${name}" already exists.`,
      HttpStatus.CONFLICT
    );
  }
}
