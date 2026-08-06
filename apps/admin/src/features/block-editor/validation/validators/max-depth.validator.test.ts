import { describe, expect, it } from 'vitest';
import { validateMaxDepth } from './max-depth.validator';
import type { BlockNode } from '../../types/block.types';

describe('validateMaxDepth', () => {
  it('passes a shallow tree', () => {
    expect(validateMaxDepth([{ id: 'b1', type: 'paragraph', data: {} }])).toEqual([]);
  });

  it('flags nesting beyond the max depth', () => {
    let deepest: BlockNode = { id: 'leaf', type: 'paragraph', data: {} };
    for (let i = 0; i < 7; i += 1) {
      deepest = { id: `c${i}`, type: 'container', data: {}, children: [deepest] };
    }
    expect(validateMaxDepth([deepest]).length).toBeGreaterThan(0);
  });
});
