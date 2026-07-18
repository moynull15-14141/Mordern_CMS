import { describe, expect, it } from 'vitest';
import { updateArticleSchema } from './update-article.schema';

const validBase = {
  title: 'Hello World',
  bodyText: 'Some content',
  status: 'DRAFT' as const,
};

describe('updateArticleSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(updateArticleSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects PUBLISHED (only settable via the dedicated Publish action)', () => {
    expect(updateArticleSchema.safeParse({ ...validBase, status: 'PUBLISHED' }).success).toBe(false);
  });

  it('rejects SCHEDULED (only settable via the dedicated Schedule action)', () => {
    expect(updateArticleSchema.safeParse({ ...validBase, status: 'SCHEDULED' }).success).toBe(false);
  });

  it('accepts REVIEW and ARCHIVED', () => {
    expect(updateArticleSchema.safeParse({ ...validBase, status: 'REVIEW' }).success).toBe(true);
    expect(updateArticleSchema.safeParse({ ...validBase, status: 'ARCHIVED' }).success).toBe(true);
  });
});
