import { describe, expect, it } from 'vitest';
import { updateReusableBlockSchema } from './update-reusable-block.schema';

const validBlock = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
const validBase = { name: 'Newsletter callout', blocks: [validBlock] };

describe('updateReusableBlockSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(updateReusableBlockSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects an empty blocks array', () => {
    expect(updateReusableBlockSchema.safeParse({ ...validBase, blocks: [] }).success).toBe(false);
  });

  it('rejects more than one top-level block', () => {
    expect(
      updateReusableBlockSchema.safeParse({ ...validBase, blocks: [validBlock, validBlock] })
        .success
    ).toBe(false);
  });

  it('accepts optional description/category', () => {
    expect(
      updateReusableBlockSchema.safeParse({
        ...validBase,
        description: 'Updated description.',
        category: 'Marketing',
      }).success
    ).toBe(true);
  });
});
