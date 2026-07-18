import { describe, expect, it } from 'vitest';
import { updateThemeSchema } from './update-theme.schema';

const validBase = { name: 'Classic', status: 'DRAFT' as const };

describe('updateThemeSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(updateThemeSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(updateThemeSchema.safeParse({ ...validBase, name: '' }).success).toBe(false);
  });

  it.each(['DRAFT', 'PUBLISHED', 'ARCHIVED'])('accepts %s as a status value', (status) => {
    expect(updateThemeSchema.safeParse({ ...validBase, status }).success).toBe(true);
  });

  it('rejects an invalid status value', () => {
    expect(updateThemeSchema.safeParse({ ...validBase, status: 'LIVE' }).success).toBe(false);
  });

  it('requires status (no dedicated-endpoint-only restriction, but the field is required on this schema)', () => {
    expect(updateThemeSchema.safeParse({ name: validBase.name }).success).toBe(false);
  });

  it('accepts optional nested settings', () => {
    expect(
      updateThemeSchema.safeParse({ ...validBase, settings: { secondaryColor: '#ffffff' } }).success
    ).toBe(true);
  });

  it('does not have an isActive field (UpdateThemeDto has none)', () => {
    const result = updateThemeSchema.safeParse({ ...validBase, isActive: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('isActive');
    }
  });
});
