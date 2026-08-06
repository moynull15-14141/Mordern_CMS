import type { BlockNode } from '../types/block.types';

/**
 * Pure, immutable operations over a `BlockNode[]` tree — the shared
 * primitive `create-editor-store.ts`'s actions (insert/update/remove/move)
 * are built from. Kept separate from the store so they're independently
 * testable and reusable by anything that needs to manipulate a tree
 * without touching Zustand (e.g. the paste/duplicate flow, or a future
 * builder's own tooling).
 */

export function findBlock(blocks: BlockNode[], id: string): BlockNode | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children) {
      const found = findBlock(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** The id of `id`'s parent block, or `null` if `id` is top-level (or not
 * found at all — the two aren't distinguished, since every caller only
 * ever invokes this with an id already known to exist). Internally
 * `undefined` (not `null`) is the "not found in this branch, keep
 * searching" signal, since `null` is itself a valid found-result
 * (top-level parent) that must not be confused with "not found." */
export function findParentId(blocks: BlockNode[], id: string): string | null {
  function search(nodes: BlockNode[], parent: string | null): string | null | undefined {
    for (const node of nodes) {
      if (node.id === id) return parent;
    }
    for (const node of nodes) {
      if (node.children) {
        const result = search(node.children, node.id);
        if (result !== undefined) return result;
      }
    }
    return undefined;
  }

  const result = search(blocks, null);
  return result === undefined ? null : result;
}

export function updateBlock(
  blocks: BlockNode[],
  id: string,
  updater: (node: BlockNode) => BlockNode
): BlockNode[] {
  return blocks.map((block) => {
    if (block.id === id) return updater(block);
    if (block.children) {
      return { ...block, children: updateBlock(block.children, id, updater) };
    }
    return block;
  });
}

export function removeBlock(blocks: BlockNode[], id: string): BlockNode[] {
  return blocks
    .filter((block) => block.id !== id)
    .map((block) =>
      block.children ? { ...block, children: removeBlock(block.children, id) } : block
    );
}

/** Inserts `node` at `index` within `parentId`'s children (or the
 * top-level list when `parentId` is `null`). `index` is clamped to the
 * target list's bounds — an out-of-range value (e.g. appending) is
 * treated as "insert at the end," never silently dropped. */
export function insertBlock(
  blocks: BlockNode[],
  node: BlockNode,
  parentId: string | null,
  index: number
): BlockNode[] {
  if (parentId === null) {
    const clamped = Math.max(0, Math.min(index, blocks.length));
    return [...blocks.slice(0, clamped), node, ...blocks.slice(clamped)];
  }

  return blocks.map((block) => {
    if (block.id === parentId) {
      const children = block.children ?? [];
      const clamped = Math.max(0, Math.min(index, children.length));
      return {
        ...block,
        children: [...children.slice(0, clamped), node, ...children.slice(clamped)],
      };
    }
    if (block.children) {
      return { ...block, children: insertBlock(block.children, node, parentId, index) };
    }
    return block;
  });
}

/** Removes `id` from wherever it is, then re-inserts it at
 * `(newParentId, newIndex)` — used by both drag-and-drop reordering and
 * the toolbar's move-up/move-down actions. Returns the original tree
 * unchanged if `id` doesn't exist. */
export function moveBlock(
  blocks: BlockNode[],
  id: string,
  newParentId: string | null,
  newIndex: number
): BlockNode[] {
  const node = findBlock(blocks, id);
  if (!node) return blocks;
  return insertBlock(removeBlock(blocks, id), node, newParentId, newIndex);
}

export function getSiblings(blocks: BlockNode[], parentId: string | null): BlockNode[] {
  if (parentId === null) return blocks;
  const parent = findBlock(blocks, parentId);
  return parent?.children ?? [];
}

/** Structural (not reference) equality between two block trees. A
 * controlled `value` prop can arrive as a new array/object reference that
 * carries the exact same content (e.g. a parent re-render that rebuilds
 * its props) — reference equality alone can't tell that apart from a
 * genuine external change, which is what caused the hydrate loop this
 * guards against (see `context/block-editor-provider.tsx` and
 * `create-editor-store.ts`'s `hydrate`). */
export function areBlockListsEqual(a: BlockNode[], b: BlockNode[]): boolean {
  return deepEqual(a, b);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object') {
    const aRecord = a as Record<string, unknown>;
    const bRecord = b as Record<string, unknown>;
    const aKeys = Object.keys(aRecord);
    const bKeys = Object.keys(bRecord);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(
      (key) => Object.hasOwn(bRecord, key) && deepEqual(aRecord[key], bRecord[key])
    );
  }

  return false;
}
