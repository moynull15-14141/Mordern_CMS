import { describe, expect, it } from 'vitest';
import { createTagSchema } from './create-tag.schema';

describe('createTagSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(createTagSchema.safeParse({ name: 'Breaking' }).success).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(createTagSchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('rejects a name over 100 characters', () => {
    expect(createTagSchema.safeParse({ name: 'a'.repeat(101) }).success).toBe(false);
  });
});
