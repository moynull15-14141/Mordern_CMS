import { describe, expect, it } from 'vitest';
import { createThemeSchema } from './create-theme.schema';

const validBase = { name: 'Classic' };

describe('createThemeSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(createThemeSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(createThemeSchema.safeParse({ ...validBase, name: '' }).success).toBe(false);
  });

  it('rejects a name over 200 characters', () => {
    expect(createThemeSchema.safeParse({ ...validBase, name: 'a'.repeat(201) }).success).toBe(
      false
    );
  });

  it('accepts an optional slug', () => {
    expect(createThemeSchema.safeParse({ ...validBase, slug: 'classic' }).success).toBe(true);
  });

  it('accepts optional version/author/description/thumbnail', () => {
    expect(
      createThemeSchema.safeParse({
        ...validBase,
        version: '1.0.0',
        author: 'Acme',
        description: 'A classic theme.',
        thumbnail: 'https://example.com/thumb.png',
      }).success
    ).toBe(true);
  });

  it('accepts optional nested settings', () => {
    expect(
      createThemeSchema.safeParse({ ...validBase, settings: { primaryColor: '#112233' } }).success
    ).toBe(true);
  });

  it('rejects an invalid nested settings.primaryColor', () => {
    expect(
      createThemeSchema.safeParse({ ...validBase, settings: { primaryColor: 'red' } }).success
    ).toBe(false);
  });

  it('does not have a status field (CreateThemeDto has none)', () => {
    const result = createThemeSchema.safeParse({ ...validBase, status: 'PUBLISHED' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('status');
    }
  });
});
