import { BlockType } from '../block-schema/block-types';

/**
 * One node in a `Article.body`/`Page.body` block tree — see
 * `block-schema/block-types.ts`'s module doc comment for the full design.
 */
export interface BlockNode {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  children?: BlockNode[];
  meta?: BlockNodeMeta;
}

/**
 * Cross-cutting, non-content-type-specific metadata every block may carry.
 * `column`/`panelId`/`tabId` are the single mechanism every container type
 * (`columns`/`accordion`/`tabs`) uses to say "which of my sub-slots does
 * this child belong to" — one mechanism reused three ways, rather than
 * three different nested-children shapes. All three are the 0-based index
 * into the parent's own `data.panels`/`data.tabs` array (or, for
 * `columns`, simply the target column) — `accordion`/`tabs` panels have no
 * separately-generated id of their own (see `BLOCK_TYPE_DESCRIPTORS`'s
 * `panels`/`tabs` field descriptors, `{title}`/`{label}` only), so the
 * array position IS the identity.
 */
export interface BlockNodeMeta {
  anchor?: string;
  cssClass?: string;
  column?: number;
  panelId?: number;
  tabId?: number;
}

export interface BlockTree {
  blocks: BlockNode[];
}
