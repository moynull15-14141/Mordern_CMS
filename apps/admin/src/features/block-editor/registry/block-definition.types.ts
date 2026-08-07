import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import type { BlockType } from '../types/block.types';

export type BlockFieldKind =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'url'
  | 'boolean'
  | 'select'
  | 'color'
  | 'list'
  | 'reusable-block-ref'
  | 'media-ref';

export interface BlockFieldOption {
  value: string;
  label: string;
}

/** Mirrors the backend `MediaType` enum
 * (`apps/backend/src/modules/media/... MediaType`) — kept as a plain
 * string union here rather than importing across apps, same "no shared
 * package wired between apps" convention this feature already follows. */
export type MediaTypeFilter = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';

/** `itemFields` is only meaningful when `kind === 'list'` — each list item
 * is itself an object shaped by `itemFields`, which may recursively
 * contain another `kind: 'list'` field (used by `table`'s
 * `rows[].cells[]`). Mirrors the backend's identical recursive design
 * (`apps/backend/src/modules/content-blocks/block-schema/block-types.ts`).
 * `mediaTypeFilter` is only meaningful when `kind === 'media-ref'` —
 * restricts the picker to one Media Library type (Milestone 5). */
export interface BlockFieldDescriptor {
  key: string;
  label: string;
  kind: BlockFieldKind;
  required?: boolean;
  options?: BlockFieldOption[];
  itemFields?: BlockFieldDescriptor[];
  defaultValue?: unknown;
  placeholder?: string;
  mediaTypeFilter?: MediaTypeFilter;
}

export type BlockFamily = 'leaf' | 'media' | 'rich' | 'action' | 'container' | 'reference';

/**
 * The registry-driven description of one block type — the single source
 * every generic subsystem reads from: the property panel renders
 * `fields`, the block picker groups by `family`, the canvas checks
 * `container` to decide whether a row accepts children, "Add block"
 * seeds a new node from `defaultData`. A future builder registering a new
 * block type (`registerBlockDefinition`) only ever needs to provide one
 * of these — nothing else in this feature changes.
 */
export interface BlockDefinition {
  type: BlockType;
  label: string;
  family: BlockFamily;
  container: boolean;
  description: string;
  icon: ComponentType<LucideProps>;
  fields: BlockFieldDescriptor[];
  defaultData: Record<string, unknown>;
}
