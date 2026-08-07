import { describe, expect, it } from 'vitest';
import { designTokensSchema } from './design-tokens.schema';

describe('designTokensSchema', () => {
  it('accepts an empty object (every field optional)', () => {
    expect(designTokensSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a partially-populated document', () => {
    const result = designTokensSchema.safeParse({
      colors: { brand: { primary: '#111827' } },
      buttons: { radius: '0.5rem' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid hex color', () => {
    const result = designTokensSchema.safeParse({ colors: { brand: { primary: 'blue' } } });
    expect(result.success).toBe(false);
  });

  it('accepts an empty-string color (untouched field)', () => {
    const result = designTokensSchema.safeParse({ colors: { brand: { primary: '' } } });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid background type', () => {
    const result = designTokensSchema.safeParse({ background: { type: 'video' } });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid typography textTransform', () => {
    const result = designTokensSchema.safeParse({
      typography: { styles: { h1: { textTransform: 'sparkle' } } },
    });
    expect(result.success).toBe(false);
  });

  it('accepts footer social links', () => {
    const result = designTokensSchema.safeParse({
      footer: { socialLinks: [{ platform: 'twitter', href: 'https://twitter.com/x' }] },
    });
    expect(result.success).toBe(true);
  });
});
