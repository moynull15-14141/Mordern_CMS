import { describe, expect, it } from 'vitest';
import { createPageSchema } from './create-page.schema';

const validBase = {
  title: 'About Us',
  body: [],
};

describe('createPageSchema', () => {
  it('accepts the minimal valid shape (an empty block list)', () => {
    expect(createPageSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(createPageSchema.safeParse({ ...validBase, title: '' }).success).toBe(false);
  });

  it('accepts a populated block list', () => {
    const populated = {
      ...validBase,
      body: [{ id: 'b1', type: 'paragraph', data: { text: 'hi' } }],
    };
    expect(createPageSchema.safeParse(populated).success).toBe(true);
  });

  it('rejects a title over 300 characters', () => {
    expect(createPageSchema.safeParse({ ...validBase, title: 'a'.repeat(301) }).success).toBe(
      false
    );
  });

  it('accepts an optional slug', () => {
    expect(createPageSchema.safeParse({ ...validBase, slug: 'about-us' }).success).toBe(true);
  });

  it('accepts optional seo fields', () => {
    expect(
      createPageSchema.safeParse({ ...validBase, seo: { title: 'SEO title', keywords: 'a, b' } })
        .success
    ).toBe(true);
  });

  it('rejects an invalid canonicalUrl in seo', () => {
    expect(
      createPageSchema.safeParse({ ...validBase, seo: { canonicalUrl: 'not-a-url' } }).success
    ).toBe(false);
  });
});
