import { Injectable } from '@nestjs/common';
import { MenuItem, MenuItemTargetType } from '@prisma/client';
import { SLUG_MAX_LENGTH, SLUG_MIN_LENGTH } from '../constants/menu.constants';
import {
  InvalidMenuItemTargetException,
  MenuSlugValidationException,
} from '../exceptions/menu.exceptions';
import { SLUG_SHAPE_PATTERN } from '../../articles/utils/slug.util';
import { wouldCreateCycle } from '../utils/menu-item-tree.util';

interface TargetFields {
  targetType: MenuItemTargetType;
  pageId?: string;
  articleId?: string;
  categoryId?: string;
  url?: string;
}

/**
 * Stateless business-rule validation beyond class-validator DTO decorators
 * — mirrors `ArticlesValidator`/`PagesValidator`. Reuses the shared
 * slug-shape pattern (`SLUG_SHAPE_PATTERN`) rather than redefining it.
 */
@Injectable()
export class MenusValidator {
  validateSlugShape(slug: string): void {
    if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
      throw new MenuSlugValidationException(
        `must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH} characters`
      );
    }
    if (!SLUG_SHAPE_PATTERN.test(slug)) {
      throw new MenuSlugValidationException(
        'must be lowercase alphanumeric words separated by single hyphens'
      );
    }
  }

  /** Exactly one of `pageId`/`articleId`/`categoryId`/`url` must be set,
   * and it must be the field matching `targetType` — no other field may
   * also be set. Prisma/Postgres has no native "exactly one of N nullable
   * FKs" constraint worth hand-writing here (same reasoning `SeoMeta`'s
   * JSON fields use for cross-field rules), so this runs at the service
   * layer instead. */
  validateItemTarget(fields: TargetFields): void {
    const provided = {
      pageId: Boolean(fields.pageId),
      articleId: Boolean(fields.articleId),
      categoryId: Boolean(fields.categoryId),
      url: Boolean(fields.url),
    };
    const providedCount = Object.values(provided).filter(Boolean).length;

    if (providedCount !== 1) {
      throw new InvalidMenuItemTargetException(
        'exactly one of pageId, articleId, categoryId, or url must be set'
      );
    }

    const expected: Record<MenuItemTargetType, keyof typeof provided> = {
      PAGE: 'pageId',
      ARTICLE: 'articleId',
      CATEGORY: 'categoryId',
      EXTERNAL_URL: 'url',
      CUSTOM_URL: 'url',
    };

    if (!provided[expected[fields.targetType]]) {
      throw new InvalidMenuItemTargetException(
        `targetType "${fields.targetType}" requires "${expected[fields.targetType]}" to be set`
      );
    }
  }

  /** Same class of check `CategoriesService.moveCategory` performs before
   * `wouldCreateCycle` — reject a self-reference before even touching the
   * full-menu item list. */
  assertNotSelfParent(itemId: string, parentId: string): boolean {
    return itemId === parentId;
  }

  assertNoCircularReference(allItems: MenuItem[], itemId: string, newParentId: string): boolean {
    return wouldCreateCycle(allItems, itemId, newParentId);
  }
}
