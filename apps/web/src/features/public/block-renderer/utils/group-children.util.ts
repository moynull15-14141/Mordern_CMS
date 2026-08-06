import type { BlockNode } from '../types/block.types';

/**
 * The single mechanism every container block type (`columns`/`accordion`/
 * `tabs`) uses to say "which of my sub-slots does this child belong to" —
 * mirrors `BlockNodeMeta`'s doc comment on the backend. One function
 * reused three ways instead of three different nested-children shapes.
 */
export function groupChildrenByMetaKey(
  children: BlockNode[] | undefined,
  metaKey: 'column' | 'panelId' | 'tabId'
): Map<number, BlockNode[]> {
  const groups = new Map<number, BlockNode[]>();
  for (const child of children ?? []) {
    const key = child.meta?.[metaKey];
    if (key === undefined) continue;
    const existing = groups.get(key);
    if (existing) {
      existing.push(child);
    } else {
      groups.set(key, [child]);
    }
  }
  return groups;
}
