/**
 * Pure, in-memory tree operations over a flat list of a menu's items —
 * same approach as `categories/utils/category-tree.util.ts` (fetch the
 * menu's full flat item list once, traverse in memory; no recursive SQL/
 * CTE, no schema change needed for "unlimited nesting"). Not implemented
 * by generically reusing `buildTree`/`wouldCreateCycle` from that file
 * because `HierarchyNode` requires `name`/`slug` fields `MenuItem` doesn't
 * have (`label`, no slug) — the algorithm is reused, the shape isn't
 * force-fit.
 */

export interface MenuItemNode {
  id: string;
  parentId: string | null;
  sortOrder: number;
}

export type MenuItemTreeNode<T extends MenuItemNode> = T & { children: MenuItemTreeNode<T>[] };

function byParentId<T extends MenuItemNode>(nodes: T[]): Map<string | null, T[]> {
  const map = new Map<string | null, T[]>();
  for (const node of nodes) {
    const key = node.parentId;
    const siblings = map.get(key) ?? [];
    siblings.push(node);
    map.set(key, siblings);
  }
  for (const siblings of map.values()) {
    siblings.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return map;
}

export function buildMenuItemTree<T extends MenuItemNode>(
  nodes: T[],
  rootParentId: string | null = null
): MenuItemTreeNode<T>[] {
  const grouped = byParentId(nodes);

  function attachChildren(node: T): MenuItemTreeNode<T> {
    const children = (grouped.get(node.id) ?? []).map(attachChildren);
    return { ...node, children };
  }

  return (grouped.get(rootParentId) ?? []).map(attachChildren);
}

function getDescendants<T extends MenuItemNode>(nodes: T[], nodeId: string): T[] {
  const grouped = byParentId(nodes);
  const result: T[] = [];

  function collect(id: string): void {
    for (const child of grouped.get(id) ?? []) {
      result.push(child);
      collect(child.id);
    }
  }

  collect(nodeId);
  return result;
}

/** True if setting `nodeId`'s parent to `newParentId` would create a cycle
 * — i.e. `newParentId` is `nodeId` itself, or one of its own descendants.
 * Mirrors `category-tree.util.ts`'s `wouldCreateCycle` exactly. */
export function wouldCreateCycle<T extends MenuItemNode>(
  nodes: T[],
  nodeId: string,
  newParentId: string
): boolean {
  if (nodeId === newParentId) return true;
  const descendants = getDescendants(nodes, nodeId);
  return descendants.some((d) => d.id === newParentId);
}
