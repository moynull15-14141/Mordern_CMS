import { describe, expect, it } from 'vitest';
import { menuItemSchema } from './menu-item.schema';

const base = {
  label: 'About',
  openMode: 'SELF' as const,
  parentId: '',
  icon: '',
  cssClass: '',
};

describe('menuItemSchema — target discriminator', () => {
  it('accepts a PAGE target with pageId set', () => {
    const result = menuItemSchema.safeParse({ ...base, targetType: 'PAGE', pageId: 'p1' });
    expect(result.success).toBe(true);
  });

  it('rejects a PAGE target with no pageId', () => {
    const result = menuItemSchema.safeParse({ ...base, targetType: 'PAGE', pageId: '' });
    expect(result.success).toBe(false);
    expect(result.success ? [] : result.error.issues.map((i) => i.path[0])).toContain('pageId');
  });

  it('accepts an ARTICLE target with articleId set', () => {
    const result = menuItemSchema.safeParse({ ...base, targetType: 'ARTICLE', articleId: 'a1' });
    expect(result.success).toBe(true);
  });

  it('accepts a CATEGORY target with categoryId set', () => {
    const result = menuItemSchema.safeParse({ ...base, targetType: 'CATEGORY', categoryId: 'c1' });
    expect(result.success).toBe(true);
  });

  it('rejects an EXTERNAL_URL target with no url', () => {
    const result = menuItemSchema.safeParse({ ...base, targetType: 'EXTERNAL_URL', url: '' });
    expect(result.success).toBe(false);
  });

  it('accepts an EXTERNAL_URL target with a real URL', () => {
    const result = menuItemSchema.safeParse({
      ...base,
      targetType: 'EXTERNAL_URL',
      url: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a CUSTOM_URL target with a URL', () => {
    const result = menuItemSchema.safeParse({ ...base, targetType: 'CUSTOM_URL', url: '/promo' });
    expect(result.success).toBe(true);
  });
});

describe('menuItemSchema — unsafe URL schemes', () => {
  it('rejects a javascript: URL', () => {
    const result = menuItemSchema.safeParse({
      ...base,
      targetType: 'EXTERNAL_URL',
      url: 'javascript:alert(1)',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a data: URL', () => {
    const result = menuItemSchema.safeParse({
      ...base,
      targetType: 'CUSTOM_URL',
      url: 'data:text/html,<script>alert(1)</script>',
    });
    expect(result.success).toBe(false);
  });

  it('is case-insensitive and tolerant of leading whitespace', () => {
    const result = menuItemSchema.safeParse({
      ...base,
      targetType: 'EXTERNAL_URL',
      url: '  JavaScript:alert(1)',
    });
    expect(result.success).toBe(false);
  });
});

describe('menuItemSchema — label', () => {
  it('rejects an empty label', () => {
    const result = menuItemSchema.safeParse({
      ...base,
      label: '',
      targetType: 'PAGE',
      pageId: 'p1',
    });
    expect(result.success).toBe(false);
  });
});
