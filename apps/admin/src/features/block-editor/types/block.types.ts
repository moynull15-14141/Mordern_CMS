/**
 * Rich Content Engine — mirrors the backend's block vocabulary field-for-field:
 * `apps/backend/src/modules/content-blocks/interfaces/block-node.interface.ts`,
 * `apps/backend/src/modules/content-blocks/block-schema/block-types.ts`. Same
 * "parallel-but-separate type definition per app" convention this module
 * already uses everywhere else (e.g. `apps/web/src/features/public/block-renderer/types/block.types.ts`).
 *
 * This feature (`block-editor/`) has ZERO imports from `features/articles`
 * or `features/pages` — it is a standalone editing framework. Those
 * features import FROM it, never the reverse.
 */
export const BLOCK_TYPES = [
  'paragraph',
  'heading',
  'image',
  'gallery',
  'video',
  'youtube',
  'vimeo',
  'quote',
  'divider',
  'table',
  'code-block',
  'html-block',
  'embed',
  'button',
  'callout',
  'alert',
  'list',
  'checklist',
  'accordion',
  'tabs',
  'file-download',
  'spacer',
  'columns',
  'container',
  'reusable-block',
] as const;

export type BuiltInBlockType = (typeof BLOCK_TYPES)[number];

/** Unlike the backend/web copies, this type is deliberately NOT a closed
 * union — `registerBlockDefinition` (registry/block-registry.ts) lets a
 * future builder register a block type this build predates, and every
 * block-editor internal that carries a `type` needs to accept that
 * without a type error. Known built-in types still get autocomplete via
 * `BuiltInBlockType`. */
export type BlockType = BuiltInBlockType | (string & {});

export const CONTAINER_BLOCK_TYPES = ['columns', 'container', 'accordion', 'tabs'] as const;

export interface BlockNodeResponsiveMeta {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

/** `column`/`panelId`/`tabId` are the 0-based index into the parent
 * container's own `data.panels`/`data.tabs`/column array — see the
 * backend's matching doc comment. `responsive` is new in this milestone
 * (editor-authored, stored, not yet consumed by the public renderer —
 * see the milestone report's "remaining work"). */
export interface BlockNodeMeta {
  anchor?: string;
  cssClass?: string;
  column?: number;
  panelId?: number;
  tabId?: number;
  responsive?: BlockNodeResponsiveMeta;
  /** Stamped client-side on a Pattern's root block(s) at insertion time
   * (Milestone 6) — a soft "inserted from" marker, never a live link.
   * `BlockTreeValidator` on the backend tolerates unknown `meta` keys, so
   * this needs no schema/migration; it naturally disappears if a user
   * edits/removes the inherited blocks, which is the point. */
  patternOrigin?: { patternId: string };
}

export interface BlockNode {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  children?: BlockNode[];
  meta?: BlockNodeMeta;
}
