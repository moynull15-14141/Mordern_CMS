import { describe, expect, it } from 'vitest';
import { createCategorySchema } from './create-category.schema';

describe('createCategorySchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(createCategorySchema.safeParse({ name: 'News' }).success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(createCategorySchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects a non-UUID parentId', () => {
    expect(createCategorySchema.safeParse({ name: 'News', parentId: 'not-a-uuid' }).success).toBe(false);
  });

  it('coerces a numeric sortOrder string', () => {
    const result = createCategorySchema.safeParse({ name: 'News', sortOrder: '5' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sortOrder).toBe(5);
  });
});
