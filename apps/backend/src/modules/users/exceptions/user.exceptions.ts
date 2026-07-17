import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode } from '../../../core/exceptions/codes';

export class UserNotFoundException extends BusinessException {
  constructor(userId: string) {
    super(BusinessErrorCode.NOT_FOUND, `User "${userId}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

/** Email/username uniqueness is enforced at the application layer only —
 * the frozen `User` model has no unique constraint on either column (see
 * docs/42_USER_MANAGEMENT_ARCHITECTURE.md "Known Gaps"). */
export class UserConflictException extends BusinessException {
  constructor(field: 'email' | 'username', value: string) {
    super(
      BusinessErrorCode.CONFLICT,
      `A user with ${field} "${value}" already exists.`,
      HttpStatus.CONFLICT
    );
  }
}

export class UserAlreadyDeletedException extends BusinessException {
  constructor(userId: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `User "${userId}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class UserNotDeletedException extends BusinessException {
  constructor(userId: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `User "${userId}" is not deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class InvalidCurrentPasswordException extends BusinessException {
  constructor() {
    super(BusinessErrorCode.RULE_VIOLATION, 'Current password is incorrect.', HttpStatus.FORBIDDEN);
  }
}

export class SessionNotFoundException extends BusinessException {
  constructor(sessionId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Session "${sessionId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class MediaAssetNotFoundException extends BusinessException {
  constructor(mediaAssetId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Media asset "${mediaAssetId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}
