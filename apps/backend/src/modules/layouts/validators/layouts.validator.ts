import { Injectable, Logger } from '@nestjs/common';
import {
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  isKnownLayoutPreset,
} from '../constants/layout.constants';
import { LayoutSlugValidationException } from '../exceptions/layout.exceptions';
import { SLUG_SHAPE_PATTERN } from '../../articles/utils/slug.util';

/**
 * Stateless business-rule validation beyond class-validator DTO decorators
 * — mirrors `ThemesValidator`/`MenusValidator`. Reuses the shared
 * slug-shape pattern rather than redefining it.
 */
@Injectable()
export class LayoutsValidator {
  private readonly logger = new Logger(LayoutsValidator.name);

  validateSlugShape(slug: string): void {
    if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
      throw new LayoutSlugValidationException(
        `must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters`
      );
    }
    if (!SLUG_SHAPE_PATTERN.test(slug)) {
      throw new LayoutSlugValidationException(
        'must be lowercase alphanumeric words separated by single hyphens'
      );
    }
  }

  /** `layoutPreset` stays an open-ended `String` column (see
   * `layout.constants.ts`'s doc comment) — an unrecognized value is
   * logged, never rejected, so a future frontend preset never gets
   * blocked by a backend that hasn't caught up yet. */
  validateLayoutPreset(layoutPreset: string): void {
    if (!isKnownLayoutPreset(layoutPreset)) {
      this.logger.warn(
        `layoutPreset "${layoutPreset}" is not one of the frontend's known LAYOUT_PRESET_NAMES — accepted anyway (open-ended field).`
      );
    }
  }
}
