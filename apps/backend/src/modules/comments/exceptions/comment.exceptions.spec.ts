import { HttpStatus } from '@nestjs/common';
import {
  CircularCommentReferenceException,
  CommentAlreadyDeletedException,
  CommentArticleNotFoundException,
  CommentAuthorNotFoundException,
  CommentNotDeletedException,
  CommentNotFoundException,
  CommentValidationException,
  ParentCommentArticleMismatchException,
  ParentCommentNotFoundException,
  SelfParentCommentException,
} from './comment.exceptions';

describe('Comment exceptions', () => {
  it('CommentNotFoundException carries a 404 status', () => {
    const err = new CommentNotFoundException('c1');
    expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(err.message).toContain('c1');
  });

  it('CommentAlreadyDeletedException carries a 409 status', () => {
    expect(new CommentAlreadyDeletedException('c1').getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('CommentNotDeletedException carries a 409 status', () => {
    expect(new CommentNotDeletedException('c1').getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('CommentArticleNotFoundException carries a 404 status', () => {
    expect(new CommentArticleNotFoundException('a1').getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('CommentAuthorNotFoundException carries a 404 status', () => {
    expect(new CommentAuthorNotFoundException('u1').getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('ParentCommentNotFoundException carries a 404 status', () => {
    expect(new ParentCommentNotFoundException('p1').getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('ParentCommentArticleMismatchException carries a 400 status', () => {
    expect(new ParentCommentArticleMismatchException('p1', 'a1').getStatus()).toBe(
      HttpStatus.BAD_REQUEST
    );
  });

  it('SelfParentCommentException carries a 400 status', () => {
    expect(new SelfParentCommentException('c1').getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('CircularCommentReferenceException carries a 400 status', () => {
    expect(new CircularCommentReferenceException('c1', 'p1').getStatus()).toBe(
      HttpStatus.BAD_REQUEST
    );
  });

  it('CommentValidationException carries a 400 status and a code', () => {
    const err = new CommentValidationException('bad body');
    expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(err.code).toBeDefined();
  });
});
