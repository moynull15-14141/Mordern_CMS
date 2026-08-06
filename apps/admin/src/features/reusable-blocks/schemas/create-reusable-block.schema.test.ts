import { describe, expect, it } from 'vitest';
import { createReusableBlockSchema } from './create-reusable-block.schema';

const validBlock = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
const validBase = { name: 'Newsletter callout', blocks: [validBlock] };

describe('createReusableBlockSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(createReusableBlockSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(createReusableBlockSchema.safeParse({ ...validBase, name: 'a' }).success).toBe(false);
  });

  it('rejects a name over 200 characters', () => {
    expect(
      createReusableBlockSchema.safeParse({ ...validBase, name: 'a'.repeat(201) }).success
    ).toBe(false);
  });

  it('accepts optional description/category', () => {
    expect(
      createReusableBlockSchema.safeParse({
        ...validBase,
        description: 'A callout for the newsletter.',
        category: 'Marketing',
      }).success
    ).toBe(true);
  });

  it('rejects an empty blocks array', () => {
    expect(createReusableBlockSchema.safeParse({ ...validBase, blocks: [] }).success).toBe(false);
  });

  it('rejects more than one top-level block', () => {
    expect(
      createReusableBlockSchema.safeParse({ ...validBase, blocks: [validBlock, validBlock] })
        .success
    ).toBe(false);
  });

  it('accepts a container block with nested children', () => {
    const container = {
      id: 'c1',
      type: 'container',
      data: {},
      children: [{ id: 'c2', type: 'paragraph', data: { text: 'nested' } }],
    };
    expect(createReusableBlockSchema.safeParse({ ...validBase, blocks: [container] }).success).toBe(
      true
    );
  });
});
