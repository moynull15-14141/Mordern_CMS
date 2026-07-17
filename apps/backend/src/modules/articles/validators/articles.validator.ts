import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import {
  GENERIC_UPDATE_ALLOWED_STATUSES,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
} from '../constants/article.constants';
import {
  InvalidStatusTransitionException,
  SlugValidationException,
} from '../exceptions/article.exceptions';
import { SLUG_SHAPE_PATTERN } from '../utils/slug.util';

/**
 * Stateless business-rule validation beyond what class-validator DTO
 * decorators express — normalized-slug shape/length, and the
 * generic-update-can't-publish rule (see docs/46_ARTICLES_ARCHITECTURE.md
 * "Status Flow").
 */
@Injectable()
export class ArticlesValidator {
  validateSlugShape(slug: string): void {
    if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
      throw new SlugValidationException(
        `must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters`
      );
    }
    if (!SLUG_SHAPE_PATTERN.test(slug)) {
      throw new SlugValidationException(
        'must be lowercase alphanumeric words separated by single hyphens'
      );
    }
  }

  /** PUBLISHED/SCHEDULED can only be reached via the dedicated
   * /articles/:id/publish and /articles/:id/schedule endpoints (gated by
   * `article.publish`), never through the generic update. */
  assertGenericUpdateStatus(status: ContentStatus | undefined): void {
    if (status && !(GENERIC_UPDATE_ALLOWED_STATUSES as readonly string[]).includes(status)) {
      throw new InvalidStatusTransitionException(
        `Status "${status}" cannot be set via a generic update — use /publish or /schedule instead.`
      );
    }
  }

  assertFutureDate(date: Date, fieldName: string): void {
    if (date.getTime() <= Date.now()) {
      throw new InvalidStatusTransitionException(`${fieldName} must be in the future.`);
    }
  }
}
