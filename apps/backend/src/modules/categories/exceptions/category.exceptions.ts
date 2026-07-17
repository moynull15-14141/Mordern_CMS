import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode, ValidationErrorCode } from '../../../core/exceptions/codes';

export class CategoryNotFoundException extends BusinessException {
  constructor(idOrSlug: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Category "${idOrSlug}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class CategoryAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Category "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class CategoryNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Category "${id}" is not deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class CategoryInUseException extends BusinessException {
  constructor(id: string, reason: 'articles' | 'children') {
    const message =
      reason === 'articles'
        ? `Category "${id}" cannot be deleted — it is still referenced by one or more articles.`
        : `Category "${id}" cannot be deleted — it still has active child categories.`;
    super(BusinessErrorCode.RULE_VIOLATION, message, HttpStatus.CONFLICT);
  }
}

export class CategorySlugConflictException extends BusinessException {
  constructor(slug: string) {
    super(
      BusinessErrorCode.CONFLICT,
      `Category slug "${slug}" is already in use.`,
      HttpStatus.CONFLICT
    );
  }
}

export class CategoryNameConflictException extends BusinessException {
  constructor(name: string) {
    super(
      BusinessErrorCode.CONFLICT,
      `Category name "${name}" is already in use.`,
      HttpStatus.CONFLICT
    );
  }
}

export class ParentCategoryNotFoundException extends BusinessException {
  constructor(parentId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Parent category "${parentId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class SelfParentException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Category "${id}" cannot be its own parent.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class CircularParentException extends BusinessException {
  constructor(id: string, parentId: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Cannot set category "${id}"'s parent to "${parentId}" — this would create a circular reference.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class SlugValidationException extends HttpException {
  constructor(
    reason: string,
    public readonly code: ValidationErrorCode = ValidationErrorCode.INVALID_INPUT
  ) {
    super({ code, message: `Slug is invalid: ${reason}` }, HttpStatus.BAD_REQUEST);
  }
}

// --- Tag ---

export class TagNotFoundException extends BusinessException {
  constructor(idOrSlug: string) {
    super(BusinessErrorCode.NOT_FOUND, `Tag "${idOrSlug}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class TagAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.RULE_VIOLATION, `Tag "${id}" is already deleted.`, HttpStatus.CONFLICT);
  }
}

export class TagNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.RULE_VIOLATION, `Tag "${id}" is not deleted.`, HttpStatus.CONFLICT);
  }
}

export class TagInUseException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Tag "${id}" cannot be deleted — it is still referenced by one or more articles.`,
      HttpStatus.CONFLICT
    );
  }
}

export class TagSlugConflictException extends BusinessException {
  constructor(slug: string) {
    super(BusinessErrorCode.CONFLICT, `Tag slug "${slug}" is already in use.`, HttpStatus.CONFLICT);
  }
}

export class TagNameConflictException extends BusinessException {
  constructor(name: string) {
    super(BusinessErrorCode.CONFLICT, `Tag name "${name}" is already in use.`, HttpStatus.CONFLICT);
  }
}
