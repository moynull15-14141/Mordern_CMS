import { Comment } from '@prisma/client';
import { COMMENT_BODY_MAX_LENGTH } from '../constants/comment.constants';
import {
  CircularCommentReferenceException,
  CommentValidationException,
  ParentCommentArticleMismatchException,
  SelfParentCommentException,
} from '../exceptions/comment.exceptions';
import { CommentsValidator } from './comments.validator';

function buildComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'parent-1',
    articleId: 'article-1',
    userId: 'user-1',
    authorName: null,
    authorEmail: null,
    parentId: null,
    body: 'hello',
    status: 'PENDING' as Comment['status'],
    moderationReason: null,
    votes: 0,
    createdAt: new Date(),
    createdBy: null,
    updatedAt: new Date(),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Comment;
}

describe('CommentsValidator', () => {
  let validator: CommentsValidator;

  beforeEach(() => {
    validator = new CommentsValidator();
  });

  describe('assertBodyValid', () => {
    it('returns the trimmed body for valid input', () => {
      expect(validator.assertBodyValid('  hello world  ')).toBe('hello world');
    });

    it('strips HTML tags before validating length', () => {
      expect(validator.assertBodyValid('<b>hi</b>')).toBe('hi');
    });

    it('throws when the body is empty', () => {
      expect(() => validator.assertBodyValid('')).toThrow(CommentValidationException);
    });

    it('throws when the body is only whitespace', () => {
      expect(() => validator.assertBodyValid('   ')).toThrow(CommentValidationException);
    });

    it('throws when the body is empty after sanitization (markup only)', () => {
      expect(() => validator.assertBodyValid('<script></script>')).toThrow(
        CommentValidationException
      );
    });

    it('throws when the body exceeds the max length', () => {
      const tooLong = 'a'.repeat(COMMENT_BODY_MAX_LENGTH + 1);
      expect(() => validator.assertBodyValid(tooLong)).toThrow(CommentValidationException);
    });

    it('accepts a body exactly at the max length', () => {
      const exact = 'a'.repeat(COMMENT_BODY_MAX_LENGTH);
      expect(validator.assertBodyValid(exact)).toBe(exact);
    });
  });

  describe('assertParentBelongsToArticle', () => {
    it('passes when the parent belongs to the same article', () => {
      const parent = buildComment({ articleId: 'article-1' });
      expect(() => validator.assertParentBelongsToArticle(parent, 'article-1')).not.toThrow();
    });

    it('throws when the parent belongs to a different article', () => {
      const parent = buildComment({ articleId: 'article-2' });
      expect(() => validator.assertParentBelongsToArticle(parent, 'article-1')).toThrow(
        ParentCommentArticleMismatchException
      );
    });
  });

  describe('assertNoCycle', () => {
    const flat = [
      { id: 'a', parentId: null },
      { id: 'a1', parentId: 'a' },
      { id: 'a1a', parentId: 'a1' },
      { id: 'b', parentId: null },
    ];

    it('passes for an unrelated new parent', () => {
      expect(() => validator.assertNoCycle(flat, 'a', 'b')).not.toThrow();
    });

    it('passes when the new parent is an ancestor of the node (not a descendant cycle)', () => {
      expect(() => validator.assertNoCycle(flat, 'a1a', 'a')).not.toThrow();
    });

    it('throws SelfParentCommentException when the new parent is the node itself', () => {
      expect(() => validator.assertNoCycle(flat, 'a', 'a')).toThrow(SelfParentCommentException);
    });

    it('throws CircularCommentReferenceException when the new parent is a descendant', () => {
      expect(() => validator.assertNoCycle(flat, 'a', 'a1a')).toThrow(
        CircularCommentReferenceException
      );
    });
  });
});
