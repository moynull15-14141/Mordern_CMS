import { describe, expect, it } from 'vitest';
import { createRedirectSchema, updateRedirectSchema } from './redirect.schema';

describe('createRedirectSchema', () => {
  it('accepts a valid internal-to-internal redirect', () => {
    const result = createRedirectSchema.safeParse({
      sourcePath: '/old-about',
      destinationUrl: '/about',
      redirectType: 301,
    });
    expect(result.success).toBe(true);
  });

  it('accepts an internal-to-external redirect', () => {
    const result = createRedirectSchema.safeParse({
      sourcePath: '/old-promo',
      destinationUrl: 'https://example.com/promo',
      redirectType: 302,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty source path', () => {
    const result = createRedirectSchema.safeParse({
      sourcePath: '',
      destinationUrl: '/about',
      redirectType: 301,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a javascript: source path', () => {
    const result = createRedirectSchema.safeParse({
      sourcePath: 'javascript:alert(1)',
      destinationUrl: '/about',
      redirectType: 301,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a data: destination', () => {
    const result = createRedirectSchema.safeParse({
      sourcePath: '/old',
      destinationUrl: 'data:text/html,<script>alert(1)</script>',
      redirectType: 301,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a redirectType that is not 301 or 302', () => {
    const result = createRedirectSchema.safeParse({
      sourcePath: '/old',
      destinationUrl: '/new',
      redirectType: 307,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateRedirectSchema', () => {
  it('requires a status in addition to the create fields', () => {
    const result = updateRedirectSchema.safeParse({
      sourcePath: '/old',
      destinationUrl: '/new',
      redirectType: 301,
      status: 'ACTIVE',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid status', () => {
    const result = updateRedirectSchema.safeParse({
      sourcePath: '/old',
      destinationUrl: '/new',
      redirectType: 301,
      status: 'DELETED',
    });
    expect(result.success).toBe(false);
  });
});
