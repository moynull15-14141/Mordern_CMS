import {
  BLOCK_TYPE_DESCRIPTORS,
  isKnownBlockType,
  type BlockFieldDescriptor,
} from '../block-schema/block-types';

export interface MediaRefBlockNodeLike {
  type: string;
  data: Record<string, unknown>;
  children?: MediaRefBlockNodeLike[];
}

function collectFromFields(
  data: Record<string, unknown>,
  fields: BlockFieldDescriptor[],
  ids: Set<string>
): void {
  for (const field of fields) {
    if (field.kind === 'media-ref') {
      const value = data[field.key];
      if (typeof value === 'string' && value.length > 0) {
        ids.add(value);
      }
    } else if (field.kind === 'list' && field.itemFields) {
      const items = data[field.key];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && typeof item === 'object') {
            collectFromFields(item as Record<string, unknown>, field.itemFields, ids);
          }
        }
      }
    }
  }
}

/**
 * Every `mediaId`-shaped value referenced anywhere in `nodes` (top level,
 * nested inside a container's `children` at any depth, or nested inside a
 * `list`-kind field's `itemFields` — needed for `gallery.images[].mediaId`),
 * deduplicated. Unlike `collectReusableBlockReferenceIds`
 * (`block-tree-references.util.ts`), which hardcodes a single block type,
 * this walk is descriptor-driven: it looks up each node's
 * `BLOCK_TYPE_DESCRIPTORS` entry and finds every field (recursively) with
 * `kind === 'media-ref'`, so a future block type gains usage-tracking for
 * free just by declaring the field kind.
 */
export function collectMediaReferenceIds(nodes: MediaRefBlockNodeLike[] | undefined): string[] {
  const ids = new Set<string>();

  function walk(node: MediaRefBlockNodeLike): void {
    if (isKnownBlockType(node.type)) {
      collectFromFields(node.data ?? {}, BLOCK_TYPE_DESCRIPTORS[node.type].fields, ids);
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
