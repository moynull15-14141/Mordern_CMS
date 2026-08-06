import { describe, expect, it } from 'vitest';
import {
  areBlockListsEqual,
  findBlock,
  findParentId,
  getSiblings,
  insertBlock,
  moveBlock,
  removeBlock,
  updateBlock,
} from './block-tree.util';
import type { BlockNode } from '../types/block.types';

function tree(): BlockNode[] {
  return [
    { id: 'a', type: 'paragraph', data: {} },
    {
      id: 'b',
      type: 'container',
      data: {},
      children: [
        { id: 'c', type: 'paragraph', data: {} },
        { id: 'd', type: 'paragraph', data: {} },
      ],
    },
  ];
}

describe('findBlock', () => {
  it('finds a top-level block', () => {
    expect(findBlock(tree(), 'a')?.id).toBe('a');
  });

  it('finds a nested block', () => {
    expect(findBlock(tree(), 'c')?.id).toBe('c');
  });

  it('returns null for a missing id', () => {
    expect(findBlock(tree(), 'missing')).toBeNull();
  });
});

describe('findParentId', () => {
  it('returns null for a top-level block', () => {
    expect(findParentId(tree(), 'a')).toBeNull();
  });

  it('returns the parent id for a nested block', () => {
    expect(findParentId(tree(), 'c')).toBe('b');
  });
});

describe('updateBlock', () => {
  it('updates a top-level block immutably', () => {
    const original = tree();
    const updated = updateBlock(original, 'a', (node) => ({ ...node, data: { text: 'changed' } }));
    expect(findBlock(updated, 'a')?.data).toEqual({ text: 'changed' });
    expect(findBlock(original, 'a')?.data).toEqual({});
  });

  it('updates a nested block', () => {
    const updated = updateBlock(tree(), 'c', (node) => ({ ...node, data: { text: 'nested' } }));
    expect(findBlock(updated, 'c')?.data).toEqual({ text: 'nested' });
  });
});

describe('removeBlock', () => {
  it('removes a top-level block', () => {
    expect(findBlock(removeBlock(tree(), 'a'), 'a')).toBeNull();
  });

  it('removes a nested block, leaving its siblings', () => {
    const updated = removeBlock(tree(), 'c');
    expect(findBlock(updated, 'c')).toBeNull();
    expect(findBlock(updated, 'd')).not.toBeNull();
  });
});

describe('insertBlock', () => {
  it('inserts at the top level at the given index', () => {
    const updated = insertBlock(tree(), { id: 'new', type: 'paragraph', data: {} }, null, 1);
    expect(updated.map((b) => b.id)).toEqual(['a', 'new', 'b']);
  });

  it('inserts into a container parent', () => {
    const updated = insertBlock(tree(), { id: 'new', type: 'paragraph', data: {} }, 'b', 1);
    expect(getSiblings(updated, 'b').map((b) => b.id)).toEqual(['c', 'new', 'd']);
  });

  it('clamps an out-of-range index to append at the end', () => {
    const updated = insertBlock(tree(), { id: 'new', type: 'paragraph', data: {} }, null, 999);
    expect(updated.at(-1)?.id).toBe('new');
  });
});

describe('moveBlock', () => {
  it('moves a top-level block into a container', () => {
    const updated = moveBlock(tree(), 'a', 'b', 0);
    expect(updated.map((b) => b.id)).toEqual(['b']);
    expect(getSiblings(updated, 'b').map((b) => b.id)).toEqual(['a', 'c', 'd']);
  });

  it('moves a nested block back to the top level', () => {
    const updated = moveBlock(tree(), 'c', null, 0);
    expect(updated.map((b) => b.id)).toEqual(['c', 'a', 'b']);
    expect(getSiblings(updated, 'b').map((b) => b.id)).toEqual(['d']);
  });

  it('returns the tree unchanged for a missing id', () => {
    const original = tree();
    expect(moveBlock(original, 'missing', null, 0)).toBe(original);
  });
});

describe('areBlockListsEqual', () => {
  it('is true for the same reference', () => {
    const list = tree();
    expect(areBlockListsEqual(list, list)).toBe(true);
  });

  it('is true for a structurally identical but differently-referenced tree', () => {
    expect(areBlockListsEqual(tree(), tree())).toBe(true);
  });

  it('is true for two separately-constructed empty arrays', () => {
    expect(areBlockListsEqual([], [])).toBe(true);
  });

  it('is false when a nested data value differs', () => {
    const other = tree();
    other[1].children![0].data = { text: 'changed' };
    expect(areBlockListsEqual(tree(), other)).toBe(false);
  });

  it('is false when block order differs', () => {
    const reordered = [...tree()].reverse();
    expect(areBlockListsEqual(tree(), reordered)).toBe(false);
  });

  it('is false when lengths differ', () => {
    expect(areBlockListsEqual(tree(), tree().slice(0, 1))).toBe(false);
  });

  it('is false when an optional field (meta) is present on only one side', () => {
    const withMeta = tree();
    withMeta[0].meta = { anchor: 'top' };
    expect(areBlockListsEqual(tree(), withMeta)).toBe(false);
  });
});
