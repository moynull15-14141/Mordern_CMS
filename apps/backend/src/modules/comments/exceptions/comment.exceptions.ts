import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../core/exceptions/business.exception';
import { BusinessErrorCode, ValidationErrorCode } from '../../../core/exceptions/codes';

export class CommentNotFoundException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.NOT_FOUND, `Comment "${id}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class CommentAlreadyDeletedException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Comment "${id}" is already deleted.`,
      HttpStatus.CONFLICT
    );
  }
}

export class CommentNotDeletedException extends BusinessException {
  constructor(id: string) {
    super(BusinessErrorCode.RULE_VIOLATION, `Comment "${id}" is not deleted.`, HttpStatus.CONFLICT);
  }
}

export class CommentArticleNotFoundException extends BusinessException {
  constructor(articleId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Article "${articleId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class CommentAuthorNotFoundException extends BusinessException {
  constructor(userId: string) {
    super(BusinessErrorCode.NOT_FOUND, `User "${userId}" was not found.`, HttpStatus.NOT_FOUND);
  }
}

export class ParentCommentNotFoundException extends BusinessException {
  constructor(parentId: string) {
    super(
      BusinessErrorCode.NOT_FOUND,
      `Parent comment "${parentId}" was not found.`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class ParentCommentArticleMismatchException extends BusinessException {
  constructor(parentId: string, articleId: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Parent comment "${parentId}" does not belong to article "${articleId}".`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class SelfParentCommentException extends BusinessException {
  constructor(id: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Comment "${id}" cannot be its own parent.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class CircularCommentReferenceException extends BusinessException {
  constructor(id: string, parentId: string) {
    super(
      BusinessErrorCode.RULE_VIOLATION,
      `Cannot set comment "${id}"'s parent to "${parentId}" — this would create a circular reference.`,
      HttpStatus.BAD_REQUEST
    );
  }
}

export class CommentValidationException extends HttpException {
  constructor(
    reason: string,
    public readonly code: ValidationErrorCode = ValidationErrorCode.INVALID_INPUT
  ) {
    super({ code, message: reason }, HttpStatus.BAD_REQUEST);
  }
}
