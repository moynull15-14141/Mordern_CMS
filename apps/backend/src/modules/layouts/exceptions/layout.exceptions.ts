import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode } from '../../../core/exceptions/codes';
import { SlugValidationException as SharedSlugValidationException } from '../../articles/exceptions/article.exceptions';

export class LayoutNotFoundException extends BusinessException {
  constructor(idOrSlug: string) {
    super(BusinessErrorCode.NOT_FOUND, `Layout "${idOrSlug}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class LayoutAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Layout "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class LayoutNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.RULE_VIOLATION, `Layout "${id}" is not deleted.`, HttpStatus.CONFLICT);
  }
}

export class LayoutSlugConflictException extends BusinessException {
  constructor(slug: string) {
    super(BusinessErrorCode.CONFLICT, `Slug "${slug}" is already in use.`, HttpStatus.CONFLICT);
  }
}

/** Reuses Articles' `SlugValidationException` shape (same code/message
 * format) rather than redeclaring an identical class — same reasoning
 * `ThemeSlugValidationException` already documents. */
export class LayoutSlugValidationException extends SharedSlugValidationException {}

export class LayoutAssignmentNotFoundException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Layout assignment "${id}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

/** Mirrors `MenuItemTargetNotFoundException` exactly — a friendly
 * "X was not found" for a bad `layoutId`/`pageId`/`articleId`/`categoryId`
 * on `AssignLayoutDto`, checked at the service layer before the write
 * (rather than surfacing a raw FK constraint violation as a generic 500). */
export class LayoutAssignmentTargetNotFoundException extends BusinessException {
  constructor(targetType: string, targetId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `${targetType} "${targetId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

/** "Exactly one of pageId/articleId/categoryId may be set, and only the
 * one matching contentType" — the brief's own shape rule, mirroring
 * `InvalidMenuItemTargetException`'s reasoning for `MenuItem`. */
export class InvalidLayoutAssignmentTargetException extends BusinessException {
  constructor(reason: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Invalid layout assignment target: ${reason}`,
      HttpStatus.BAD_REQUEST
    );
  }
}
