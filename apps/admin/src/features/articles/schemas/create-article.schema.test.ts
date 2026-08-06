import { describe, expect, it } from 'vitest';
import { createArticleSchema } from './create-article.schema';

const validBase = {
  title: 'Hello World',
  body: [],
  authorId: '11111111-1111-1111-1111-111111111111',
  language: 'en',
  locale: 'en-US',
};

describe('createArticleSchema', () => {
  it('accepts the minimal valid shape (an empty block list)', () => {
    expect(createArticleSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(createArticleSchema.safeParse({ ...validBase, title: '' }).success).toBe(false);
  });

  it('accepts a populated block list', () => {
    const populated = {
      ...validBase,
      body: [{ id: 'b1', type: 'paragraph', data: { text: 'hi' } }],
    };
    expect(createArticleSchema.safeParse(populated).success).toBe(true);
  });

  it('rejects a block missing a required shape field (e.g. id)', () => {
    const malformed = { ...validBase, body: [{ type: 'paragraph', data: {} }] };
    expect(createArticleSchema.safeParse(malformed).success).toBe(false);
  });

  it('rejects a non-UUID authorId', () => {
    expect(createArticleSchema.safeParse({ ...validBase, authorId: 'not-a-uuid' }).success).toBe(
      false
    );
  });

  it('rejects an invalid visibility value', () => {
    expect(createArticleSchema.safeParse({ ...validBase, visibility: 'HIDDEN' }).success).toBe(
      false
    );
  });

  it('accepts a valid visibility value', () => {
    expect(createArticleSchema.safeParse({ ...validBase, visibility: 'PRIVATE' }).success).toBe(
      true
    );
  });
});
