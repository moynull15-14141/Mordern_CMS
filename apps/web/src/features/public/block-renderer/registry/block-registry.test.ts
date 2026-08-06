import { describe, expect, it } from 'vitest';
import { BLOCK_REGISTRY, getBlockComponent } from './block-registry';
import { BLOCK_TYPES } from '../types/block.types';

describe('BLOCK_REGISTRY', () => {
  it('has exactly one registered component per known block type', () => {
    for (const type of BLOCK_TYPES) {
      expect(BLOCK_REGISTRY[type]).toBeTypeOf('function');
    }
    expect(Object.keys(BLOCK_REGISTRY).sort()).toEqual([...BLOCK_TYPES].sort());
  });
});

describe('getBlockComponent', () => {
  it('resolves a registered component for a known type', () => {
    expect(getBlockComponent('paragraph')).toBe(BLOCK_REGISTRY.paragraph);
  });

  it('returns undefined for an unknown type instead of throwing', () => {
    expect(getBlockComponent('not-a-real-type')).toBeUndefined();
  });
});
