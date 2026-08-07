export interface PatternOriginNodeLike {
  meta?: unknown;
  children?: PatternOriginNodeLike[];
}

/**
 * Every distinct pattern id found in `meta.patternOrigin.patternId` across
 * `nodes`, at any depth — the "inserted from" marker the admin Block
 * Editor stamps client-side on the root of a freshly-inserted pattern copy
 * (see `insertClonedNodes`). Insertion is always a detached copy, so this
 * is a provenance signal, never a live reference: if a user heavily edits
 * or removes the inherited blocks, the marker naturally disappears with
 * them rather than being tracked separately.
 */
export function collectPatternOriginIds(nodes: PatternOriginNodeLike[] | undefined): string[] {
  const ids = new Set<string>();

  function walk(node: PatternOriginNodeLike): void {
    const meta = node.meta as { patternOrigin?: { patternId?: unknown } } | null | undefined;
    const origin = meta?.patternOrigin;
    if (origin && typeof origin.patternId === 'string' && origin.patternId.length > 0) {
      ids.add(origin.patternId);
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
