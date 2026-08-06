import type { ReactNode } from 'react';

/**
 * Rich Content Engine — Phase 1 / Step 1. Mirrors the backend's block
 * vocabulary field-for-field:
 * `apps/backend/src/modules/content-blocks/block-schema/block-types.ts`'s
 * `BLOCK_TYPES` and `apps/backend/src/modules/content-blocks/interfaces/block-node.interface.ts`'s
 * `BlockNode` — the same "parallel-but-separate type definition per app"
 * convention every other cross-app contract in this codebase already uses
 * (e.g. `PublicTheme` mirroring `PublicThemeResponseDto`,
 * `LAYOUT_PRESET_NAMES` mirroring `layoutPreset`). Kept in sync by hand;
 * `packages/types` is unpopulated and wired into nothing, so this is not a
 * new gap, just the existing one applied consistently.
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

export type BlockType = (typeof BLOCK_TYPES)[number];

export function isKnownBlockType(value: string): value is BlockType {
  return (BLOCK_TYPES as readonly string[]).includes(value);
}

/** `column`/`panelId`/`tabId` are the 0-based index into the parent
 * container's own `data.panels`/`data.tabs`/column array — see
 * `apps/backend/src/modules/content-blocks/interfaces/block-node.interface.ts`'s
 * matching doc comment. */
export interface BlockNodeMeta {
  anchor?: string;
  cssClass?: string;
  column?: number;
  panelId?: number;
  tabId?: number;
}

export interface BlockNode {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  children?: BlockNode[];
  meta?: BlockNodeMeta;
}

export interface BlockTree {
  blocks: BlockNode[];
}

export interface BlockComponentProps {
  block: BlockNode;
}

/** A block component may be an ordinary (sync) component or an async
 * Server Component — `ReusableBlockRenderer` fetches its referenced
 * block's data server-side before rendering, which Next.js's App Router
 * supports natively for components rendered inside a Server Component
 * tree. `ComponentType` from `react` isn't used here to keep this a
 * dependency-free types file; the shape is structurally identical. */
export type BlockComponent = (props: BlockComponentProps) => ReactNode | Promise<ReactNode>;
