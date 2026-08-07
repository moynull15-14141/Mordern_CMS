/**
 * Rich Content Engine — Phase 1 / Step 1 block vocabulary.
 *
 * `Article.body`/`Page.body` are stored as `{ blocks: BlockNode[] }` (still
 * a plain `Json` Prisma column — no migration for this, only for
 * `ReusableBlock`, see `../../../../../config/prisma/schema.prisma`).
 *
 * This file is the single source of truth for the 24 supported block
 * types on the backend and is mirrored by hand in `apps/web` (rendering)
 * and `apps/admin` (editing) — the same "no shared package wired between
 * apps" convention `layouts/constants/layout.constants.ts`'s
 * `LAYOUT_PRESET_NAMES` doc comment already establishes for this codebase
 * (a `packages/types` workspace exists but is unpopulated and wired into
 * nothing; pulling it in is a bigger structural change than this step).
 *
 * `BlockTypeDescriptor.fields` doubles as the schema `BlockTreeValidator`
 * checks against AND the data the admin block-settings form renders from
 * — one definition drives both validation and UI, so no block type is
 * ever hardcoded into a rendering branch (the brief's own requirement).
 *
 * "Block Metadata" and "Nested Blocks" from the brief are cross-cutting
 * capabilities, not block types of their own: metadata is `BlockNode.meta`
 * (every block), nesting is `BlockNode.children` (container types only).
 * "Syntax Highlight" is the `code-block` type's `language` field, not a
 * separate type. "Reusable Blocks" is the `reusable-block` reference type
 * below, backed by the new `ReusableBlock` Prisma model.
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

/** Container types carry `children: BlockNode[]` — everything else is a leaf. */
export const CONTAINER_BLOCK_TYPES = ['columns', 'container', 'accordion', 'tabs'] as const;
export type ContainerBlockType = (typeof CONTAINER_BLOCK_TYPES)[number];

export function isContainerBlockType(type: BlockType): type is ContainerBlockType {
  return (CONTAINER_BLOCK_TYPES as readonly string[]).includes(type);
}

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

/**
 * `itemFields` is only meaningful when `kind === 'list'` — each list item
 * is itself an object shaped by `itemFields`, which may recursively
 * contain another `kind: 'list'` field (used by `table`'s
 * `rows[].cells[]`). This recursion is what lets `table` be expressed
 * without a bespoke "grid editor" block type of its own.
 */
export interface BlockFieldDescriptor {
  key: string;
  label: string;
  kind: BlockFieldKind;
  required?: boolean;
  options?: BlockFieldOption[];
  itemFields?: BlockFieldDescriptor[];
  defaultValue?: unknown;
  placeholder?: string;
}

export interface BlockTypeDescriptor {
  type: BlockType;
  label: string;
  family: 'leaf' | 'media' | 'rich' | 'action' | 'container' | 'reference';
  container: boolean;
  /** Short blurb shown in the admin "Add block" picker. */
  description: string;
  fields: BlockFieldDescriptor[];
}

const listOf = (
  itemFields: BlockFieldDescriptor[]
): Pick<BlockFieldDescriptor, 'kind' | 'itemFields'> => ({
  kind: 'list',
  itemFields,
});

export const BLOCK_TYPE_DESCRIPTORS: Record<BlockType, BlockTypeDescriptor> = {
  paragraph: {
    type: 'paragraph',
    label: 'Paragraph',
    family: 'leaf',
    container: false,
    description: 'A block of body text.',
    fields: [{ key: 'text', label: 'Text', kind: 'richtext', required: true }],
  },
  heading: {
    type: 'heading',
    label: 'Heading',
    family: 'leaf',
    container: false,
    description: 'A section heading, H1 through H6.',
    fields: [
      { key: 'text', label: 'Text', kind: 'text', required: true },
      {
        key: 'level',
        label: 'Level',
        kind: 'select',
        required: true,
        defaultValue: '2',
        options: [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `H${n}` })),
      },
    ],
  },
  image: {
    type: 'image',
    label: 'Image',
    family: 'media',
    container: false,
    description: 'A single image with alt text and an optional caption.',
    fields: [
      { key: 'mediaId', label: 'Image', kind: 'media-ref', required: true },
      { key: 'alt', label: 'Alt text', kind: 'text', required: true },
      { key: 'caption', label: 'Caption', kind: 'text' },
    ],
  },
  gallery: {
    type: 'gallery',
    label: 'Gallery',
    family: 'media',
    container: false,
    description: 'A grid of multiple images.',
    fields: [
      {
        key: 'images',
        label: 'Images',
        ...listOf([
          { key: 'mediaId', label: 'Image', kind: 'media-ref', required: true },
          { key: 'alt', label: 'Alt text', kind: 'text', required: true },
          { key: 'caption', label: 'Caption', kind: 'text' },
        ]),
      },
    ],
  },
  video: {
    type: 'video',
    label: 'Video',
    family: 'media',
    container: false,
    description: 'A self-hosted / direct-link video file.',
    fields: [
      { key: 'mediaId', label: 'Video', kind: 'media-ref', required: true },
      { key: 'posterMediaId', label: 'Poster image', kind: 'media-ref' },
      { key: 'caption', label: 'Caption', kind: 'text' },
    ],
  },
  youtube: {
    type: 'youtube',
    label: 'YouTube',
    family: 'media',
    container: false,
    description: 'An embedded YouTube video.',
    fields: [
      { key: 'videoId', label: 'YouTube video ID', kind: 'text', required: true },
      { key: 'caption', label: 'Caption', kind: 'text' },
    ],
  },
  vimeo: {
    type: 'vimeo',
    label: 'Vimeo',
    family: 'media',
    container: false,
    description: 'An embedded Vimeo video.',
    fields: [
      { key: 'videoId', label: 'Vimeo video ID', kind: 'text', required: true },
      { key: 'caption', label: 'Caption', kind: 'text' },
    ],
  },
  quote: {
    type: 'quote',
    label: 'Quote',
    family: 'leaf',
    container: false,
    description: 'A block quotation with an optional citation.',
    fields: [
      { key: 'text', label: 'Quote', kind: 'richtext', required: true },
      { key: 'citation', label: 'Citation', kind: 'text' },
    ],
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    family: 'leaf',
    container: false,
    description: 'A horizontal rule separating content.',
    fields: [],
  },
  table: {
    type: 'table',
    label: 'Table',
    family: 'rich',
    container: false,
    description: 'A data table with header and body rows.',
    fields: [
      {
        key: 'headers',
        label: 'Header cells',
        ...listOf([{ key: 'text', label: 'Text', kind: 'text', required: true }]),
      },
      {
        key: 'rows',
        label: 'Rows',
        ...listOf([
          {
            key: 'cells',
            label: 'Cells',
            ...listOf([{ key: 'text', label: 'Text', kind: 'text', required: true }]),
          },
        ]),
      },
    ],
  },
  'code-block': {
    type: 'code-block',
    label: 'Code block',
    family: 'rich',
    container: false,
    description: 'A syntax-highlighted code snippet.',
    fields: [
      { key: 'code', label: 'Code', kind: 'textarea', required: true },
      { key: 'language', label: 'Language', kind: 'text', placeholder: 'e.g. typescript' },
    ],
  },
  'html-block': {
    type: 'html-block',
    label: 'HTML block',
    family: 'rich',
    container: false,
    description:
      'Raw HTML, run through an allow-list sanitizer (see sanitization/html-sanitize.config.ts) before it is ever stored.',
    fields: [{ key: 'html', label: 'HTML', kind: 'textarea', required: true }],
  },
  embed: {
    type: 'embed',
    label: 'Embed',
    family: 'rich',
    container: false,
    description: 'A generic sandboxed iframe embed (e.g. a map, a tweet, a form).',
    fields: [
      { key: 'url', label: 'Embed URL', kind: 'url', required: true },
      { key: 'caption', label: 'Caption', kind: 'text' },
    ],
  },
  button: {
    type: 'button',
    label: 'Button',
    family: 'action',
    container: false,
    description: 'A call-to-action link styled as a button.',
    fields: [
      { key: 'label', label: 'Label', kind: 'text', required: true },
      { key: 'url', label: 'URL', kind: 'url', required: true },
      {
        key: 'style',
        label: 'Style',
        kind: 'select',
        defaultValue: 'primary',
        options: ['primary', 'secondary', 'outline', 'ghost'].map((v) => ({ value: v, label: v })),
      },
      { key: 'openInNewTab', label: 'Open in new tab', kind: 'boolean', defaultValue: false },
    ],
  },
  callout: {
    type: 'callout',
    label: 'Callout',
    family: 'action',
    container: false,
    description: 'A highlighted note box.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'text', label: 'Text', kind: 'richtext', required: true },
      {
        key: 'tone',
        label: 'Tone',
        kind: 'select',
        defaultValue: 'info',
        options: ['info', 'success', 'warning'].map((v) => ({ value: v, label: v })),
      },
    ],
  },
  alert: {
    type: 'alert',
    label: 'Alert',
    family: 'action',
    container: false,
    description: 'A prominent status message.',
    fields: [
      { key: 'text', label: 'Text', kind: 'richtext', required: true },
      {
        key: 'tone',
        label: 'Tone',
        kind: 'select',
        required: true,
        defaultValue: 'info',
        options: ['info', 'success', 'warning', 'critical'].map((v) => ({ value: v, label: v })),
      },
    ],
  },
  list: {
    type: 'list',
    label: 'List',
    family: 'leaf',
    container: false,
    description: 'An ordered or unordered list.',
    fields: [
      {
        key: 'style',
        label: 'Style',
        kind: 'select',
        required: true,
        defaultValue: 'unordered',
        options: [
          { value: 'unordered', label: 'Bulleted' },
          { value: 'ordered', label: 'Numbered' },
        ],
      },
      {
        key: 'items',
        label: 'Items',
        ...listOf([{ key: 'text', label: 'Text', kind: 'text', required: true }]),
      },
    ],
  },
  checklist: {
    type: 'checklist',
    label: 'Checklist',
    family: 'leaf',
    container: false,
    description: 'A list of checked/unchecked items.',
    fields: [
      {
        key: 'items',
        label: 'Items',
        ...listOf([
          { key: 'text', label: 'Text', kind: 'text', required: true },
          { key: 'checked', label: 'Checked', kind: 'boolean', defaultValue: false },
        ]),
      },
    ],
  },
  accordion: {
    type: 'accordion',
    label: 'Accordion',
    family: 'container',
    container: true,
    description: 'Collapsible panels. Add child blocks and assign each to a panel.',
    fields: [
      {
        key: 'panels',
        label: 'Panels',
        ...listOf([{ key: 'title', label: 'Panel title', kind: 'text', required: true }]),
      },
    ],
  },
  tabs: {
    type: 'tabs',
    label: 'Tabs',
    family: 'container',
    container: true,
    description: 'Tabbed panels. Add child blocks and assign each to a tab.',
    fields: [
      {
        key: 'tabs',
        label: 'Tabs',
        ...listOf([{ key: 'label', label: 'Tab label', kind: 'text', required: true }]),
      },
    ],
  },
  'file-download': {
    type: 'file-download',
    label: 'File download',
    family: 'media',
    container: false,
    description: 'A downloadable file link.',
    fields: [
      { key: 'mediaId', label: 'File', kind: 'media-ref', required: true },
      { key: 'filename', label: 'Display filename', kind: 'text' },
      {
        key: 'filesize',
        label: 'File size (display text)',
        kind: 'text',
        placeholder: 'e.g. 2.4 MB',
      },
    ],
  },
  spacer: {
    type: 'spacer',
    label: 'Spacer',
    family: 'leaf',
    container: false,
    description: 'Vertical whitespace.',
    fields: [
      { key: 'height', label: 'Height (px)', kind: 'number', required: true, defaultValue: 40 },
    ],
  },
  columns: {
    type: 'columns',
    label: 'Columns',
    family: 'container',
    container: true,
    description: 'A multi-column layout. Add child blocks and assign each to a column.',
    fields: [
      {
        key: 'columnCount',
        label: 'Number of columns',
        kind: 'select',
        required: true,
        defaultValue: '2',
        options: ['2', '3', '4'].map((v) => ({ value: v, label: v })),
      },
    ],
  },
  container: {
    type: 'container',
    label: 'Container',
    family: 'container',
    container: true,
    description: 'A section wrapper with width/background/padding controls around its children.',
    fields: [
      {
        key: 'maxWidth',
        label: 'Max width',
        kind: 'select',
        defaultValue: 'normal',
        options: ['narrow', 'normal', 'wide', 'full'].map((v) => ({ value: v, label: v })),
      },
      { key: 'background', label: 'Background color', kind: 'color' },
      {
        key: 'padding',
        label: 'Padding',
        kind: 'select',
        defaultValue: 'md',
        options: ['none', 'sm', 'md', 'lg'].map((v) => ({ value: v, label: v })),
      },
    ],
  },
  'reusable-block': {
    type: 'reusable-block',
    label: 'Reusable block',
    family: 'reference',
    container: false,
    description: 'Insert a block from the Reusable Blocks library by reference.',
    fields: [
      {
        key: 'reusableBlockId',
        label: 'Reusable block',
        kind: 'reusable-block-ref',
        required: true,
      },
    ],
  },
};

/** Bounds enforced by `BlockTreeValidator` — prevents pathological trees
 * (accidental infinite recursion client-side, abuse) without being a real
 * content ceiling for any legitimate article/page. */
export const MAX_BLOCK_TREE_DEPTH = 6;
export const MAX_BLOCKS_PER_TREE = 500;
