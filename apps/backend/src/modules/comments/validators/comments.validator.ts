import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { COMMENT_BODY_MAX_LENGTH, COMMENT_BODY_MIN_LENGTH } from '../constants/comment.constants';
import {
  CircularCommentReferenceException,
  CommentValidationException,
  ParentCommentArticleMismatchException,
  SelfParentCommentException,
} from '../exceptions/comment.exceptions';
import { sanitizeCommentBody } from '../utils/sanitize-body.util';
import { getCommentDescendants } from '../utils/comment-tree.util';

@Injectable()
export class CommentsValidator {
  /** Sanitizes (strips HTML) and validates non-empty / length-bounded body.
   * Returns the sanitized value — callers must persist THIS, not the raw
   * input, since sanitization can change the string's length/emptiness. */
  assertBodyValid(rawBody: string): string {
    const sanitized = sanitizeCommentBody(rawBody);
    if (sanitized.length < COMMENT_BODY_MIN_LENGTH) {
      throw new CommentValidationException('Comment body cannot be empty.');
    }
    if (sanitized.length > COMMENT_BODY_MAX_LENGTH) {
      throw new CommentValidationException(
        `Comment body cannot exceed ${COMMENT_BODY_MAX_LENGTH} characters.`
      );
    }
    return sanitized;
  }

  /** A parent comment must belong to the SAME article as the child being
   * created — cross-article reply threads are never valid. */
  assertParentBelongsToArticle(parent: Comment, articleId: string): void {
    if (parent.articleId !== articleId) {
      throw new ParentCommentArticleMismatchException(parent.id, articleId);
    }
  }

  /** Defense-in-depth only — unreachable via the current API since no
   * "change parent" operation exists (see `utils/comment-tree.util.ts`). */
  assertNoCycle(
    allCommentsOnArticle: { id: string; parentId: string | null }[],
    commentId: string,
    newParentId: string
  ): void {
    if (commentId === newParentId) {
      throw new SelfParentCommentException(commentId);
    }
    const descendants = getCommentDescendants(allCommentsOnArticle, commentId);
    if (descendants.some((d) => d.id === newParentId)) {
      throw new CircularCommentReferenceException(commentId, newParentId);
    }
  }
}
