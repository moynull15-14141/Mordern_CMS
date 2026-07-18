import { describe, expect, it } from 'vitest';
import { updateCategorySchema } from './update-category.schema';

describe('updateCategorySchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(updateCategorySchema.safeParse({ name: 'News', status: 'ACTIVE' }).success).toBe(true);
  });

  it('rejects an invalid status value', () => {
    expect(updateCategorySchema.safeParse({ name: 'News', status: 'HIDDEN' }).success).toBe(false);
  });

  it('accepts both real status values', () => {
    expect(updateCategorySchema.safeParse({ name: 'News', status: 'ACTIVE' }).success).toBe(true);
    expect(updateCategorySchema.safeParse({ name: 'News', status: 'INACTIVE' }).success).toBe(true);
  });
});
