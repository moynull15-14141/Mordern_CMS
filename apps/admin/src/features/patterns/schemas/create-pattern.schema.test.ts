import { describe, expect, it } from 'vitest';
import { createPatternSchema } from './create-pattern.schema';

const validBlock = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
const validBase = { name: 'Hero section', blocks: [validBlock] };

describe('createPatternSchema', () => {
  it('accepts the minimal valid shape', () => {
    expect(createPatternSchema.safeParse(validBase).success).toBe(true);
  });

  it('rejects a name shorter than 2 characters', () => {
    expect(createPatternSchema.safeParse({ ...validBase, name: 'a' }).success).toBe(false);
  });

  it('rejects a name over 200 characters', () => {
    expect(createPatternSchema.safeParse({ ...validBase, name: 'a'.repeat(201) }).success).toBe(
      false
    );
  });

  it('accepts optional description/category/tags', () => {
    expect(
      createPatternSchema.safeParse({
        ...validBase,
        description: 'A hero section for landing pages.',
        category: 'Hero',
        tags: 'landing, marketing',
      }).success
    ).toBe(true);
  });

  it('rejects an empty blocks array', () => {
    expect(createPatternSchema.safeParse({ ...validBase, blocks: [] }).success).toBe(false);
  });

  it('accepts more than one top-level block — a pattern is a whole section, not one wrapped block', () => {
    expect(
      createPatternSchema.safeParse({ ...validBase, blocks: [validBlock, validBlock] }).success
    ).toBe(true);
  });

  it('accepts a container block with nested children', () => {
    const container = {
      id: 'c1',
      type: 'container',
      data: {},
      children: [{ id: 'c2', type: 'paragraph', data: { text: 'nested' } }],
    };
    expect(createPatternSchema.safeParse({ ...validBase, blocks: [container] }).success).toBe(true);
  });
});
