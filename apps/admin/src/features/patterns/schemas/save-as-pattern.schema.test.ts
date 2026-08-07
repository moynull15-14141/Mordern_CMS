import { describe, expect, it } from 'vitest';
import { saveAsPatternSchema } from './save-as-pattern.schema';

describe('saveAsPatternSchema', () => {
  it('accepts a valid name with no description/category/tags', () => {
    expect(saveAsPatternSchema.safeParse({ name: 'Hero section' }).success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(saveAsPatternSchema.safeParse({ name: 'a' }).success).toBe(false);
  });

  it('accepts optional description/category/tags', () => {
    expect(
      saveAsPatternSchema.safeParse({
        name: 'Hero section',
        description: 'A landing page hero.',
        category: 'Hero',
        tags: 'landing, marketing',
      }).success
    ).toBe(true);
  });
});
