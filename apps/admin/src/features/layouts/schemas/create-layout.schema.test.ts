import { describe, expect, it } from 'vitest';
import { createLayoutSchema } from './create-layout.schema';

const validBase = { name: 'Default', layoutPreset: 'default' };

describe('createLayoutSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(createLayoutSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(createLayoutSchema.safeParse({ ...validBase, name: '' }).success).toBe(false);
  });

  it('rejects a name over 200 characters', () => {
    expect(createLayoutSchema.safeParse({ ...validBase, name: 'a'.repeat(201) }).success).toBe(
      false
    );
  });

  it('rejects an empty layoutPreset', () => {
    expect(createLayoutSchema.safeParse({ ...validBase, layoutPreset: '' }).success).toBe(false);
  });

  it('accepts an optional slug', () => {
    expect(createLayoutSchema.safeParse({ ...validBase, slug: 'default' }).success).toBe(true);
  });

  it('accepts an optional themeId', () => {
    expect(createLayoutSchema.safeParse({ ...validBase, themeId: 'theme-1' }).success).toBe(true);
  });

  it('does not have a status field (CreateLayoutDto has none)', () => {
    const result = createLayoutSchema.safeParse({ ...validBase, status: 'PUBLISHED' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('status');
    }
  });
});
