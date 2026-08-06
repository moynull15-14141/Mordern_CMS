import { describe, expect, it } from 'vitest';
import { validateMaxCount } from './max-count.validator';
import type { BlockNode } from '../../types/block.types';

describe('validateMaxCount', () => {
  it('passes a small tree', () => {
    expect(validateMaxCount([{ id: 'b1', type: 'paragraph', data: {} }])).toEqual([]);
  });

  it('flags a tree exceeding the max block count', () => {
    const blocks: BlockNode[] = Array.from({ length: 501 }, (_, i) => ({
      id: `b${i}`,
      type: 'paragraph',
      data: {},
    }));
    expect(validateMaxCount(blocks)).toHaveLength(1);
  });

  it('counts nested children toward the total', () => {
    const blocks: BlockNode[] = [
      {
        id: 'b1',
        type: 'container',
        data: {},
        children: Array.from({ length: 500 }, (_, i) => ({
          id: `c${i}`,
          type: 'paragraph' as const,
          data: {},
        })),
      },
    ];
    expect(validateMaxCount(blocks)).toHaveLength(1);
  });
});
