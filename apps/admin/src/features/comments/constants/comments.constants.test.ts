import { describe, expect, it } from 'vitest';
import {
  COMMENTS_DEFAULT_PAGE_SIZE,
  COMMENT_BODY_MAX_LENGTH,
  COMMENT_BODY_MIN_LENGTH,
  COMMENT_MODERATION_REASON_MAX_LENGTH,
  COMMENT_SORT_OPTIONS,
  COMMENT_STATUS_BADGE_VARIANT,
  COMMENT_STATUS_LABELS,
  COMMENT_STATUS_OPTIONS,
} from './comments.constants';

describe('comments.constants', () => {
  it('uses the expected default page size', () => {
    expect(COMMENTS_DEFAULT_PAGE_SIZE).toBe(20);
  });

  it('mirrors the backend comment body bounds', () => {
    expect(COMMENT_BODY_MIN_LENGTH).toBe(1);
    expect(COMMENT_BODY_MAX_LENGTH).toBe(5000);
  });

  it('mirrors the backend moderation reason bound', () => {
    expect(COMMENT_MODERATION_REASON_MAX_LENGTH).toBe(1000);
  });

  it('covers every comment status label', () => {
    expect(COMMENT_STATUS_LABELS).toEqual({
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      SPAM: 'Spam',
    });
  });

  it('covers every comment status badge variant', () => {
    expect(COMMENT_STATUS_BADGE_VARIANT).toEqual({
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'destructive',
      SPAM: 'destructive',
    });
  });

  it('exposes the real sort fields only', () => {
    expect(COMMENT_SORT_OPTIONS.map((option) => option.value)).toEqual(['createdAt', 'updatedAt', 'votes']);
  });

  it('exposes the real status filters only', () => {
    expect(COMMENT_STATUS_OPTIONS.map((option) => option.value)).toEqual([
      'PENDING',
      'APPROVED',
      'REJECTED',
      'SPAM',
    ]);
  });
});
