import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode, ValidationErrorCode } from '../../../core/exceptions/codes';

export class SeoMetaNotFoundException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.NOT_FOUND, `SEO metadata "${id}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class SeoMetaAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `SEO metadata "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class SeoMetaNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `SEO metadata "${id}" is not deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class SeoSiteNotFoundException extends BusinessException {
  constructor(siteId: string) {
    super(BusinessErrorCode.NOT_FOUND, `Site "${siteId}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class SeoArticleNotFoundException extends BusinessException {
  constructor(articleId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Article "${articleId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class SeoCategoryNotFoundException extends BusinessException {
  constructor(categoryId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Category "${categoryId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class SeoPageNotFoundException extends BusinessException {
  constructor(pageId: string) {
    super(BusinessErrorCode.NOT_FOUND, `Page "${pageId}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

/** The owning entity exists but has no `seoMetaId` linked — a distinct
 * condition from the entity itself being missing. */
export class SeoMetaNotLinkedException extends BusinessException {
  constructor(entityType: 'article' | 'category' | 'page', entityId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `${entityType[0]!.toUpperCase()}${entityType.slice(1)} "${entityId}" has no SEO metadata linked.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class SeoValidationException extends HttpException {
  constructor(
    reason: string,
    public readonly code: ValidationErrorCode = ValidationErrorCode.INVALID_INPUT
  ) {
    super({ code, message: reason }, HttpStatus.BAD_REQUEST);
  }
}
