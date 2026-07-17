/**
 * Pure, in-memory tree operations over a flat list of a site's hierarchical
 * records (Category or, since Milestone 10, MediaFolder — both share the
 * same `id`/`parentId`/`name`/`slug` self-relation shape). Generic so this
 * logic is written once and reused, not duplicated per module — see
 * docs/47_CATEGORY_TAG_ARCHITECTURE.md "Tree Strategy" and
 * docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Folder Tree". Deliberately not
 * implemented as recursive SQL (CTEs) — "unlimited nesting" is satisfied by
 * fetching the site's full flat list once (a small table in practice) and
 * traversing it in memory, which needs no raw SQL and no schema change.
 */

export interface HierarchyNode {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder?: number | null;
}

export type TreeNode<T extends HierarchyNode> = T & { children: TreeNode<T>[] };

export interface BreadcrumbItem {
  id: string;
  name: string;
  slug: string;
}

function byParentId<T extends HierarchyNode>(nodes: T[]): Map<string | null, T[]> {
  const map = new Map<string | null, T[]>();
  for (const node of nodes) {
    const key = node.parentId;
    const siblings = map.get(key) ?? [];
    siblings.push(node);
    map.set(key, siblings);
  }
  for (const siblings of map.values()) {
    siblings.sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
    );
  }
  return map;
}

export function buildTree<T extends HierarchyNode>(
  nodes: T[],
  rootParentId: string | null = null
): TreeNode<T>[] {
  const grouped = byParentId(nodes);

  function attachChildren(node: T): TreeNode<T> {
    const children = (grouped.get(node.id) ?? []).map(attachChildren);
    return { ...node, children };
  }

  return (grouped.get(rootParentId) ?? []).map(attachChildren);
}

export function getChildren<T extends HierarchyNode>(nodes: T[], nodeId: string): T[] {
  return nodes.filter((n) => n.parentId === nodeId);
}

export function getDescendants<T extends HierarchyNode>(nodes: T[], nodeId: string): T[] {
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

export function getAncestors<T extends HierarchyNode>(nodes: T[], nodeId: string): T[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const result: T[] = [];
  let current = byId.get(nodeId);

  while (current?.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    result.push(parent);
    current = parent;
  }

  return result.reverse(); // root-first
}

export function getBreadcrumb<T extends HierarchyNode>(
  nodes: T[],
  nodeId: string
): BreadcrumbItem[] {
  const self = nodes.find((n) => n.id === nodeId);
  if (!self) return [];
  const ancestors = getAncestors(nodes, nodeId);
  return [...ancestors, self].map((n) => ({ id: n.id, name: n.name, slug: n.slug }));
}

/** True if setting `nodeId`'s parent to `newParentId` would create a cycle
 * — i.e. `newParentId` is `nodeId` itself, or one of its own descendants. */
export function wouldCreateCycle<T extends HierarchyNode>(
  nodes: T[],
  nodeId: string,
  newParentId: string
): boolean {
  if (nodeId === newParentId) return true;
  const descendants = getDescendants(nodes, nodeId);
  return descendants.some((d) => d.id === newParentId);
}
