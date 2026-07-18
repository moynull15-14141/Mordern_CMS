import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode } from '../../../core/exceptions/codes';
import { SlugValidationException as SharedSlugValidationException } from '../../articles/exceptions/article.exceptions';

export class MenuNotFoundException extends BusinessException {
  constructor(idOrSlug: string) {
    super(BusinessErrorCode.NOT_FOUND, `Menu "${idOrSlug}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class MenuAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Menu "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class MenuNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.RULE_VIOLATION, `Menu "${id}" is not deleted.`, HttpStatus.CONFLICT);
  }
}

export class MenuSlugConflictException extends BusinessException {
  constructor(slug: string) {
    super(BusinessErrorCode.CONFLICT, `Slug "${slug}" is already in use.`, HttpStatus.CONFLICT);
  }
}

/** Backend Milestone 11.4 — mirrors `MenuSlugConflictException` exactly,
 * only ever thrown when `location` is a non-empty value (see
 * `MenusRepository.findByLocation`'s doc comment). */
export class MenuLocationConflictException extends BusinessException {
  constructor(location: string) {
    super(
      BusinessErrorCode.CONFLICT,
      `Location "${location}" is already in use by another menu on this site.`,
      HttpStatus.CONFLICT
    );
  }
}

/** Reuses Articles' `SlugValidationException` shape (same code/message
 * format) rather than redeclaring an identical class — no behavior
 * differs, only the module raising it. */
export class MenuSlugValidationException extends SharedSlugValidationException {}

export class MenuItemNotFoundException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.NOT_FOUND, `Menu item "${id}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class MenuItemInUseException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Menu item "${id}" cannot be deleted — it still has active child items.`,
      HttpStatus.CONFLICT
    );
  }
}

export class ParentMenuItemNotFoundException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Parent menu item "${id}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class SelfParentMenuItemException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Menu item "${id}" cannot be its own parent.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class CircularMenuItemParentException extends BusinessException {
  constructor(id: string, parentId: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Cannot set menu item "${id}"'s parent to "${parentId}" — this would create a circular reference.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class MenuItemParentSiteMismatchException extends BusinessException {
  constructor(parentId: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Parent menu item "${parentId}" belongs to a different menu.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidMenuItemTargetException extends BusinessException {
  constructor(reason: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Invalid menu item target: ${reason}`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class MenuItemTargetNotFoundException extends BusinessException {
  constructor(targetType: string, targetId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `${targetType} "${targetId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}
