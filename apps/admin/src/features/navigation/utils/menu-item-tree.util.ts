import type { MenuItem, ReorderMenuItemsInput } from '../types/menu';

/** Client-side mirror of the backend's own tree utility
 * (`apps/backend/.../utils/menu-item-tree.util.ts`) — same operations
 * (find/siblings/descendants/cycle-check), reimplemented here because the
 * admin only ever has the already-fetched nested tree in memory, not the
 * flat list the backend works from. The backend remains the final
 * authority (§A.7) — these are for immediate UI feedback only (disabling
 * an invalid "move into" target, computing the reorder payload), never a
 * substitute for the server's own validation. */

export function findNode(tree: MenuItem[], id: string): MenuItem | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

export function findParentId(tree: MenuItem[], id: string): string | null {
  for (const node of tree) {
    if (node.children.some((child) => child.id === id)) return node.id;
    const found = findParentId(node.children, id);
    if (found !== null) return found;
  }
  return null;
}

export function getSiblings(tree: MenuItem[], parentId: string | null): MenuItem[] {
  if (parentId === null) return tree;
  const parent = findNode(tree, parentId);
  return parent ? parent.children : [];
}

/** Every id in `id`'s subtree, including `id` itself — used to keep a
 * node (and its own descendants) out of its own "move into" candidate
 * list, mirroring the backend's `wouldCreateCycle` guard client-side. */
export function getSubtreeIds(node: MenuItem): Set<string> {
  const ids = new Set<string>([node.id]);
  for (const child of node.children) {
    for (const id of getSubtreeIds(child)) ids.add(id);
  }
  return ids;
}

export function countItems(tree: MenuItem[]): number {
  return tree.reduce((sum, node) => sum + 1 + countItems(node.children), 0);
}

/** Removes `id` from wherever it currently sits, returning the detached
 * node plus the resulting tree — the shared first step for every
 * structural operation below. */
function detach(tree: MenuItem[], id: string): { node: MenuItem | null; rest: MenuItem[] } {
  let removed: MenuItem | null = null;
  const rest = tree
    .filter((node) => {
      if (node.id === id) {
        removed = node;
        return false;
      }
      return true;
    })
    .map((node) => {
      if (removed) return node;
      const child = detach(node.children, id);
      if (child.node) removed = child.node;
      return { ...node, children: child.rest };
    });
  return { node: removed, rest };
}

/** Inserts `node` as a child of `parentId` (or top-level, if `null`) at
 * `index`, renumbering that level's `sortOrder` 0..n so a subsequent
 * `toReorderPayload` reflects the real, contiguous order. */
function insertAt(
  tree: MenuItem[],
  parentId: string | null,
  node: MenuItem,
  index: number
): MenuItem[] {
  if (parentId === null) {
    const next = [...tree];
    next.splice(index, 0, node);
    return next.map((item, i) => ({ ...item, sortOrder: i }));
  }
  return tree.map((item) => {
    if (item.id === parentId) {
      const children = [...item.children];
      children.splice(index, 0, node);
      return { ...item, children: children.map((child, i) => ({ ...child, sortOrder: i })) };
    }
    return { ...item, children: insertAt(item.children, parentId, node, index) };
  });
}

/** Moves `activeId` to be a child of `newParentId` at `newIndex` — the
 * one operation backing drag-and-drop, indent/outdent, and move up/down
 * alike. Refuses to move a node into itself or its own descendant
 * (mirrors the backend's `SelfParentMenuItemException`/
 * `CircularMenuItemParentException`), returning the tree unchanged. */
export function moveItem(
  tree: MenuItem[],
  activeId: string,
  newParentId: string | null,
  newIndex: number
): MenuItem[] {
  if (activeId === newParentId) return tree;
  const active = findNode(tree, activeId);
  if (!active) return tree;
  if (newParentId !== null && getSubtreeIds(active).has(newParentId)) return tree;

  const { node, rest } = detach(tree, activeId);
  if (!node) return tree;
  return insertAt(rest, newParentId, { ...node, parentId: newParentId }, newIndex);
}

/** Flattens the tree into a depth-annotated list for the "Parent item"
 * select — `excludeIds` keeps an item (and, when editing, its own
 * descendants) out of its own candidate parent list, the same
 * self/circular-reference guard `moveItem` enforces for drag-and-drop. */
export function flattenForParentOptions(
  tree: MenuItem[],
  excludeIds: Set<string> = new Set()
): { id: string; label: string; depth: number }[] {
  const result: { id: string; label: string; depth: number }[] = [];
  function walk(nodes: MenuItem[], depth: number) {
    for (const node of nodes) {
      if (!excludeIds.has(node.id)) {
        result.push({ id: node.id, label: node.label, depth });
        walk(node.children, depth + 1);
      }
    }
  }
  walk(tree, 0);
  return result;
}

/** Flattens the whole tree into the exact `{id, parentId, sortOrder}[]`
 * shape `ReorderMenuItemsDto` expects — one call after any structural
 * change (reorder within a level, nest, un-nest) persists the entire new
 * structure in one transaction, per §A.2's "validated before any write"
 * behavior. */
export function toReorderPayload(tree: MenuItem[]): ReorderMenuItemsInput {
  const items: ReorderMenuItemsInput['items'] = [];
  function walk(nodes: MenuItem[], parentId: string | null) {
    nodes.forEach((node, index) => {
      items.push({ id: node.id, parentId, sortOrder: index });
      walk(node.children, node.id);
    });
  }
  walk(tree, null);
  return { items };
}
