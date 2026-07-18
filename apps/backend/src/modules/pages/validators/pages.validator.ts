import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import {
  GENERIC_UPDATE_ALLOWED_STATUSES,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
} from '../constants/page.constants';
import {
  PageInvalidStatusTransitionException,
  PageSlugValidationException,
} from '../exceptions/page.exceptions';
import { SLUG_SHAPE_PATTERN } from '../../articles/utils/slug.util';

/** Stateless business-rule validation beyond class-validator DTO decorators
 * — mirrors `ArticlesValidator`. Reuses the shared slug-shape pattern
 * (`SLUG_SHAPE_PATTERN`) rather than redefining it — already the
 * established cross-module reuse (Articles' own doc calls out Categories &
 * Tags reusing this same constant). */
@Injectable()
export class PagesValidator {
  validateSlugShape(slug: string): void {
    if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
      throw new PageSlugValidationException(
        `must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters`
      );
    }
    if (!SLUG_SHAPE_PATTERN.test(slug)) {
      throw new PageSlugValidationException(
        'must be lowercase alphanumeric words separated by single hyphens'
      );
    }
  }

  /** PUBLISHED can only be reached via the dedicated /pages/:id/publish
   * endpoint, never through the generic update. */
  assertGenericUpdateStatus(status: ContentStatus | undefined): void {
    if (status && !(GENERIC_UPDATE_ALLOWED_STATUSES as readonly string[]).includes(status)) {
      throw new PageInvalidStatusTransitionException(
        `Status "${status}" cannot be set via a generic update — use /publish instead.`
      );
    }
  }
}
