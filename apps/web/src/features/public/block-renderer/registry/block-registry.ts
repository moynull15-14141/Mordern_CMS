import type { BlockComponent, BlockType } from '../types/block.types';
import { ParagraphBlock } from '../components/paragraph-block';
import { HeadingBlock } from '../components/heading-block';
import { ImageBlock } from '../components/image-block';
import { GalleryBlock } from '../components/gallery-block';
import { VideoBlock } from '../components/video-block';
import { YoutubeBlock } from '../components/youtube-block';
import { VimeoBlock } from '../components/vimeo-block';
import { QuoteBlock } from '../components/quote-block';
import { DividerBlock } from '../components/divider-block';
import { TableBlock } from '../components/table-block';
import { CodeBlockBlock } from '../components/code-block-block';
import { HtmlBlock } from '../components/html-block';
import { EmbedBlock } from '../components/embed-block';
import { ButtonBlock } from '../components/button-block';
import { CalloutBlock } from '../components/callout-block';
import { AlertBlock } from '../components/alert-block';
import { ListBlock } from '../components/list-block';
import { ChecklistBlock } from '../components/checklist-block';
import { AccordionBlock } from '../components/accordion-block';
import { TabsBlock } from '../components/tabs-block';
import { FileDownloadBlock } from '../components/file-download-block';
import { SpacerBlock } from '../components/spacer-block';
import { ColumnsBlock } from '../components/columns-block';
import { ContainerBlock } from '../components/container-block';
import { ReusableBlockRenderer } from '../components/reusable-block';

/**
 * `BlockType -> presentational component`. This is the *entire* dispatch
 * mechanism for block rendering — `render-block-list.tsx` (the one place
 * that walks a block array) does a single `BLOCK_REGISTRY[block.type]`
 * lookup per block, never a `switch`/`if`-chain on `block.type`. Adding a
 * 25th block type later means one new registry entry + one new component
 * file, never touching the renderer itself — the same "registry, not
 * switch statements" rule `theme-renderer/registry/layout-registry.ts`
 * already establishes for layout presets in this codebase.
 */
export const BLOCK_REGISTRY: Record<BlockType, BlockComponent> = {
  paragraph: ParagraphBlock,
  heading: HeadingBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  video: VideoBlock,
  youtube: YoutubeBlock,
  vimeo: VimeoBlock,
  quote: QuoteBlock,
  divider: DividerBlock,
  table: TableBlock,
  'code-block': CodeBlockBlock,
  'html-block': HtmlBlock,
  embed: EmbedBlock,
  button: ButtonBlock,
  callout: CalloutBlock,
  alert: AlertBlock,
  list: ListBlock,
  checklist: ChecklistBlock,
  accordion: AccordionBlock,
  tabs: TabsBlock,
  'file-download': FileDownloadBlock,
  spacer: SpacerBlock,
  columns: ColumnsBlock,
  container: ContainerBlock,
  'reusable-block': ReusableBlockRenderer,
};

/** Never throws — an unrecognized `block.type` (a future block type this
 * build predates, or malformed data) resolves to `undefined`, and
 * `render-block-list.tsx` renders nothing for that node, matching
 * `theme-registry.ts`'s "never returns an error, degrades to nothing"
 * convention. */
export function getBlockComponent(type: string): BlockComponent | undefined {
  return BLOCK_REGISTRY[type as BlockType];
}
