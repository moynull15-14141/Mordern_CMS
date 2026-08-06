import { describe, expect, it } from 'vitest';
import { saveAsReusableBlockSchema } from './save-as-reusable-block.schema';

describe('saveAsReusableBlockSchema', () => {
  it('accepts a valid name with no description/category', () => {
    expect(saveAsReusableBlockSchema.safeParse({ name: 'Newsletter callout' }).success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(saveAsReusableBlockSchema.safeParse({ name: 'a' }).success).toBe(false);
  });

  it('accepts optional description/category', () => {
    expect(
      saveAsReusableBlockSchema.safeParse({
        name: 'Newsletter callout',
        description: 'A callout.',
        category: 'Marketing',
      }).success
    ).toBe(true);
  });
});
