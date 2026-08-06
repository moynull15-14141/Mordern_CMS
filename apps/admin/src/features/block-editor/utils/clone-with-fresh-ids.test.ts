import { describe, expect, it } from 'vitest';
import { cloneWithFreshIds } from './clone-with-fresh-ids';
import type { BlockNode } from '../types/block.types';

describe('cloneWithFreshIds', () => {
  it('assigns a new id to the root', () => {
    const original: BlockNode = { id: 'a', type: 'paragraph', data: { text: 'hi' } };
    const clone = cloneWithFreshIds(original);
    expect(clone.id).not.toBe('a');
    expect(clone.data).toEqual({ text: 'hi' });
  });

  it('assigns new ids recursively to every child', () => {
    const original: BlockNode = {
      id: 'a',
      type: 'container',
      data: {},
      children: [
        { id: 'b', type: 'paragraph', data: {} },
        {
          id: 'c',
          type: 'container',
          data: {},
          children: [{ id: 'd', type: 'paragraph', data: {} }],
        },
      ],
    };
    const clone = cloneWithFreshIds(original);
    const ids = [
      clone.id,
      clone.children![0].id,
      clone.children![1].id,
      clone.children![1].children![0].id,
    ];
    expect(new Set(ids).size).toBe(4);
    expect(ids).not.toContain('a');
    expect(ids).not.toContain('b');
    expect(ids).not.toContain('c');
    expect(ids).not.toContain('d');
  });
});
