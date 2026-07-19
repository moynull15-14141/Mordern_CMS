import { describe, expect, it } from 'vitest';
import { updateLayoutSchema } from './update-layout.schema';

const validBase = {
  name: 'Default',
  slug: 'default',
  layoutPreset: 'default',
  status: 'DRAFT' as const,
};

describe('updateLayoutSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(updateLayoutSchema.safeParse(validBase).success).toBe(true);
  });

  it('requires a non-empty slug (unlike CreateLayoutDto, the Edit form always has one)', () => {
    expect(updateLayoutSchema.safeParse({ ...validBase, slug: '' }).success).toBe(false);
  });

  it('accepts an optional themeId', () => {
    expect(updateLayoutSchema.safeParse({ ...validBase, themeId: 'theme-1' }).success).toBe(true);
  });

  it.each(['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const)('accepts status %s', (status) => {
    expect(updateLayoutSchema.safeParse({ ...validBase, status }).success).toBe(true);
  });

  it('rejects an invalid status', () => {
    expect(updateLayoutSchema.safeParse({ ...validBase, status: 'LIVE' }).success).toBe(false);
  });
});
