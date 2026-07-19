import { Injectable } from '@nestjs/common';
import { LayoutAssignmentContentType } from '@prisma/client';
import { InvalidLayoutAssignmentTargetException } from '../exceptions/layout.exceptions';

interface TargetFields {
  contentType: LayoutAssignmentContentType;
  pageId?: string | null;
  articleId?: string | null;
  categoryId?: string | null;
}

/**
 * Stateless business-rule validation for `LayoutAssignment`'s polymorphic
 * target — the same class of check `MenusValidator.validateItemTarget`
 * performs for `MenuItem.pageId`/`.articleId`/`.categoryId`, adapted for
 * this model's own rule: at most one entity FK may be set (zero means
 * "content-type-wide default" — see `LayoutAssignment`'s Prisma doc
 * comment), and HOMEPAGE never has any entity FK at all (there is no
 * `Homepage` model to reference).
 */
@Injectable()
export class LayoutAssignmentsValidator {
  validateAssignmentTarget(fields: TargetFields): void {
    const provided = {
      pageId: Boolean(fields.pageId),
      articleId: Boolean(fields.articleId),
      categoryId: Boolean(fields.categoryId),
    };
    const providedCount = Object.values(provided).filter(Boolean).length;

    if (fields.contentType === 'HOMEPAGE') {
      if (providedCount > 0) {
        throw new InvalidLayoutAssignmentTargetException(
          'contentType "HOMEPAGE" must not set pageId, articleId, or categoryId'
        );
      }
      return;
    }

    if (providedCount > 1) {
      throw new InvalidLayoutAssignmentTargetException(
        'at most one of pageId, articleId, or categoryId may be set'
      );
    }

    if (providedCount === 0) {
      // No entity FK set — a content-type-wide default assignment. Valid.
      return;
    }

    const expected: Record<'PAGE' | 'ARTICLE' | 'CATEGORY', keyof typeof provided> = {
      PAGE: 'pageId',
      ARTICLE: 'articleId',
      CATEGORY: 'categoryId',
    };
    const requiredField = expected[fields.contentType as 'PAGE' | 'ARTICLE' | 'CATEGORY'];

    if (!provided[requiredField]) {
      throw new InvalidLayoutAssignmentTargetException(
        `contentType "${fields.contentType}" requires "${requiredField}" (if any entity FK is set) to be the one that is set`
      );
    }
  }
}
