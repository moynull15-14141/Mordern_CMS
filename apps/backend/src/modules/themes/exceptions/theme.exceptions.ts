import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode } from '../../../core/exceptions/codes';
import { SlugValidationException as SharedSlugValidationException } from '../../articles/exceptions/article.exceptions';

export class ThemeNotFoundException extends BusinessException {
  constructor(idOrSlug: string) {
    super(BusinessErrorCode.NOT_FOUND, `Theme "${idOrSlug}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class NoActiveThemeException extends BusinessException {
  constructor() {
    super(
      BusinessErrorCode.NOT_FOUND,
      'No active theme is set for this site.',
      HttpStatus.NOT_FOUND
    );
  }
}

export class ThemeAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Theme "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class ThemeNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.RULE_VIOLATION, `Theme "${id}" is not deleted.`, HttpStatus.CONFLICT);
  }
}

export class ThemeSlugConflictException extends BusinessException {
  constructor(slug: string) {
    super(BusinessErrorCode.CONFLICT, `Slug "${slug}" is already in use.`, HttpStatus.CONFLICT);
  }
}

/** Reuses Articles' `SlugValidationException` shape (same code/message
 * format) rather than redeclaring an identical class. */
export class ThemeSlugValidationException extends SharedSlugValidationException {}

/** "Reject activating deleted themes" — the brief's own rule. Distinct
 * from `ThemeNotFoundException` even though a soft-deleted theme also
 * 404s on a normal lookup: this fires specifically from
 * `activateTheme()`'s explicit includeDeleted check, so the error message
 * names the real cause instead of a generic not-found. */
export class ThemeDeletedCannotActivateException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Theme "${id}" is deleted and cannot be activated.`,
      HttpStatus.CONFLICT
    );
  }
}
