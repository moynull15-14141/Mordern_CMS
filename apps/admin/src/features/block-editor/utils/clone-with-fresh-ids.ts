import type { BlockNode } from '../types/block.types';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Used by paste/duplicate — a copied/duplicated block must never share
 * an id with its source (both `insertBlock` and React `key`s assume
 * unique ids), so every id in the subtree is regenerated recursively. */
export function cloneWithFreshIds(node: BlockNode): BlockNode {
  return {
    ...node,
    id: generateId(),
    children: node.children?.map(cloneWithFreshIds),
  };
}
