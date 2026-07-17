import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode, ValidationErrorCode } from '../../../core/exceptions/codes';

export class MediaAssetNotFoundException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.NOT_FOUND, `Media asset "${id}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class MediaAssetAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Media asset "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class MediaAssetNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Media asset "${id}" is not deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class MediaAssetInUseException extends BusinessException {
  constructor(id: string, usageCount: number) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Media asset "${id}" cannot be deleted — it is still referenced in ${usageCount} place(s).`,
      HttpStatus.CONFLICT
    );
  }
}

export class StorageKeyConflictException extends BusinessException {
  constructor(storageKey: string) {
    super(
      BusinessErrorCode.CONFLICT,
      `Storage key "${storageKey}" is already in use.`,
      HttpStatus.CONFLICT
    );
  }
}

export class MediaValidationException extends HttpException {
  constructor(
    reason: string,
    public readonly code: ValidationErrorCode = ValidationErrorCode.INVALID_INPUT
  ) {
    super({ code, message: reason }, HttpStatus.BAD_REQUEST);
  }
}

// --- Folder ---

export class MediaFolderNotFoundException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.NOT_FOUND, `Media folder "${id}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class MediaFolderAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Media folder "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class MediaFolderNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Media folder "${id}" is not deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class MediaFolderInUseException extends BusinessException {
  constructor(id: string, reason: 'assets' | 'children') {
    const message =
      reason === 'assets'
        ? `Media folder "${id}" cannot be deleted — it still contains media assets.`
        : `Media folder "${id}" cannot be deleted — it still has active child folders.`;
    super(BusinessErrorCode.RULE_VIOLATION, message, HttpStatus.CONFLICT);
  }
}

export class MediaFolderSlugConflictException extends BusinessException {
  constructor(slug: string) {
    super(
      BusinessErrorCode.CONFLICT,
      `Media folder slug "${slug}" is already in use.`,
      HttpStatus.CONFLICT
    );
  }
}

export class ParentFolderNotFoundException extends BusinessException {
  constructor(parentId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Parent folder "${parentId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class SelfParentFolderException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Folder "${id}" cannot be its own parent.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class CircularFolderParentException extends BusinessException {
  constructor(id: string, parentId: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Cannot set folder "${id}"'s parent to "${parentId}" — this would create a circular reference.`,
      HttpStatus.BAD_REQUEST
    );
  }
}
