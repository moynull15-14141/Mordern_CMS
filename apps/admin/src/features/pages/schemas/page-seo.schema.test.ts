import { describe, expect, it } from 'vitest';
import { pageSeoSchema } from './page-seo.schema';

describe('pageSeoSchema', () => {
  it('accepts an empty object (every field optional)', () => {
    expect(pageSeoSchema.safeParse({}).success).toBe(true);
  });

  it('rejects a title over 200 characters', () => {
    expect(pageSeoSchema.safeParse({ title: 'a'.repeat(201) }).success).toBe(false);
  });

  it('rejects a description over 500 characters', () => {
    expect(pageSeoSchema.safeParse({ description: 'a'.repeat(501) }).success).toBe(false);
  });

  it('accepts an empty-string canonicalUrl', () => {
    expect(pageSeoSchema.safeParse({ canonicalUrl: '' }).success).toBe(true);
  });

  it('rejects a non-URL canonicalUrl', () => {
    expect(pageSeoSchema.safeParse({ canonicalUrl: 'not-a-url' }).success).toBe(false);
  });

  it('accepts a valid canonicalUrl', () => {
    expect(pageSeoSchema.safeParse({ canonicalUrl: 'https://example.com/about' }).success).toBe(
      true
    );
  });
});
