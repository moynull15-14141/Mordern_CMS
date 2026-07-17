import { Injectable } from '@nestjs/common';
import { SLUG_SHAPE_PATTERN } from '../../articles/utils/slug.util';
import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from '../constants/category.constants';
import { SlugValidationException } from '../exceptions/category.exceptions';

/**
 * Stateless slug-shape validation, reusing the exact same pattern
 * (`SLUG_SHAPE_PATTERN`) Articles uses — not re-implemented — per the
 * "no duplicate validation" instruction. Shared by both CategoriesService
 * and TagsService (same slug rule for both). Hierarchy/parent/uniqueness
 * checks require repository access and therefore live in the services, not
 * here (same split ArticlesValidator/ArticlesService uses).
 */
@Injectable()
export class SlugShapeValidator {
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
}
