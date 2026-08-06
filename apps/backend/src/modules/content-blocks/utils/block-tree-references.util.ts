export interface BlockNodeLike {
  type: string;
  data: Record<string, unknown>;
  children?: BlockNodeLike[];
}

/**
 * Every `reusableBlockId` referenced anywhere in `nodes` (top level, or
 * nested inside a container's `children` at any depth), deduplicated.
 * Shared by `ReusableBlockCycleValidator` (walks a candidate/persisted
 * block's own tree looking for outgoing references) and
 * `ReusableBlocksService.computeUsages` (walks a Page/Article body.blocks
 * tree looking for incoming references to one specific id).
 */
export function collectReusableBlockReferenceIds(nodes: BlockNodeLike[] | undefined): string[] {
  const ids = new Set<string>();

  function walk(node: BlockNodeLike): void {
    if (node.type === 'reusable-block') {
      const id = node.data?.reusableBlockId;
      if (typeof id === 'string' && id.length > 0) {
        ids.add(id);
      }
    }
    for (const child of node.children ?? []) {
      walk(child);
    }
  }

  for (const node of nodes ?? []) {
    walk(node);
  }

  return Array.from(ids);
}
