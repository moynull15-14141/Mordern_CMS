/**
 * Pure, in-memory tree operations over a flat list of a single article's
 * comments. NOT built on `modules/categories/utils/category-tree.util.ts`'s
 * generic `HierarchyNode<T>` — that shape requires `name`/`slug`, which
 * `Comment` has neither of, so genericizing it further (as Media's
 * `MediaFolder` reuse did) would force fake fields onto an unrelated model.
 * A small, comment-specific equivalent is written instead — see
 * docs/49_COMMENTS_ARCHITECTURE.md "Reply Flow".
 */

export interface CommentNode {
  id: string;
  parentId: string | null;
}

export type CommentTreeNode<T extends CommentNode> = T & { children: CommentTreeNode<T>[] };

function byParentId<T extends CommentNode>(nodes: T[]): Map<string | null, T[]> {
  const map = new Map<string | null, T[]>();
  for (const node of nodes) {
    const siblings = map.get(node.parentId) ?? [];
    siblings.push(node);
    map.set(node.parentId, siblings);
  }
  return map;
}

/** Builds the full nested reply tree rooted at `rootParentId` (default:
 * top-level comments only). Unlimited depth — no max-depth check, per the
 * milestone brief's "Unlimited depth" requirement. */
export function buildCommentTree<T extends CommentNode>(
  nodes: T[],
  rootParentId: string | null = null
): CommentTreeNode<T>[] {
  const grouped = byParentId(nodes);

  function attachChildren(node: T): CommentTreeNode<T> {
    const children = (grouped.get(node.id) ?? []).map(attachChildren);
    return { ...node, children };
  }

  return (grouped.get(rootParentId) ?? []).map(attachChildren);
}

/** Every descendant (all levels) of `nodeId` — used defensively to reject a
 * parent assignment that would create a cycle. Comments never expose a
 * "change parent" operation today, so this is unreachable via the API, but
 * is kept as a guard in `CommentsValidator` for defense-in-depth. */
export function getCommentDescendants<T extends CommentNode>(nodes: T[], nodeId: string): T[] {
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

export function wouldCreateCommentCycle<T extends CommentNode>(
  nodes: T[],
  nodeId: string,
  newParentId: string
): boolean {
  if (nodeId === newParentId) return true;
  return getCommentDescendants(nodes, nodeId).some((d) => d.id === newParentId);
}
