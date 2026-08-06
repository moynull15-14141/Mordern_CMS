import { describe, expect, it } from 'vitest';
import { groupChildrenByMetaKey } from './group-children.util';
import type { BlockNode } from '../types/block.types';

describe('groupChildrenByMetaKey', () => {
  it('groups children by the given meta key', () => {
    const children: BlockNode[] = [
      { id: 'a', type: 'paragraph', data: {}, meta: { column: 0 } },
      { id: 'b', type: 'paragraph', data: {}, meta: { column: 1 } },
      { id: 'c', type: 'paragraph', data: {}, meta: { column: 0 } },
    ];
    const grouped = groupChildrenByMetaKey(children, 'column');
    expect(grouped.get(0)?.map((n) => n.id)).toEqual(['a', 'c']);
    expect(grouped.get(1)?.map((n) => n.id)).toEqual(['b']);
  });

  it('omits children with no value for the given meta key', () => {
    const children: BlockNode[] = [{ id: 'a', type: 'paragraph', data: {} }];
    expect(groupChildrenByMetaKey(children, 'panelId').size).toBe(0);
  });

  it('returns an empty map for undefined children', () => {
    expect(groupChildrenByMetaKey(undefined, 'tabId').size).toBe(0);
  });
});
