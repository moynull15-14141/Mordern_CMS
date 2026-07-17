import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode, ValidationErrorCode } from '../../../core/exceptions/codes';

export class ArticleNotFoundException extends BusinessException {
  constructor(idOrSlug: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Article "${idOrSlug}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class ArticleAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Article "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class ArticleNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.RULE_VIOLATION, `Article "${id}" is not deleted.`, HttpStatus.CONFLICT);
  }
}

export class SlugConflictException extends BusinessException {
  constructor(slug: string) {
    super(BusinessErrorCode.CONFLICT, `Slug "${slug}" is already in use.`, HttpStatus.CONFLICT);
  }
}

export class SlugValidationException extends HttpException {
  constructor(
    reason: string,
    public readonly code: ValidationErrorCode = ValidationErrorCode.INVALID_INPUT
  ) {
    super({ code, message: `Slug is invalid: ${reason}` }, HttpStatus.BAD_REQUEST);
  }
}

export class InvalidStatusTransitionException extends BusinessException {
  constructor(reason: string) {
    super(BusinessErrorCode.RULE_VIOLATION, reason, HttpStatus.BAD_REQUEST);
  }
}

export class AuthorNotFoundException extends BusinessException {
  constructor(authorId: string) {
    super(BusinessErrorCode.NOT_FOUND, `Author "${authorId}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class CategoryNotFoundException extends BusinessException {
  constructor(categoryId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Category "${categoryId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class TagNotFoundException extends BusinessException {
  constructor(tagId: string) {
    super(BusinessErrorCode.NOT_FOUND, `Tag "${tagId}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class ArticleRevisionNotFoundException extends BusinessException {
  constructor(version: number) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Revision version ${version} was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}
