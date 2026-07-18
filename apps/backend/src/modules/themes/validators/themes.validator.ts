import { Injectable } from '@nestjs/common';
import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from '../constants/theme.constants';
import { ThemeSlugValidationException } from '../exceptions/theme.exceptions';
import { SLUG_SHAPE_PATTERN } from '../../articles/utils/slug.util';

/** Stateless business-rule validation beyond class-validator DTO
 * decorators — mirrors `MenusValidator`/`PagesValidator`. Reuses the
 * shared slug-shape pattern rather than redefining it. */
@Injectable()
export class ThemesValidator {
  validateSlugShape(slug: string): void {
    if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
      throw new ThemeSlugValidationException(
        `must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters`
      );
    }
    if (!SLUG_SHAPE_PATTERN.test(slug)) {
      throw new ThemeSlugValidationException(
        'must be lowercase alphanumeric words separated by single hyphens'
      );
    }
  }
}
