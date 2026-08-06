import type { BlockNode } from './types/block.types';
import { renderBlockList } from './render-block-list';

/**
 * Public entry point — `ArticleRenderer`/`PageRenderer` render an
 * article/page's body through this, replacing the previous inert
 * placeholder (`data-testid="article-body-placeholder"`/
 * `"page-body-placeholder"`). Thin by design: all the real dispatch logic
 * lives in `render-block-list.tsx` so container block components
 * (`ColumnsBlock`, etc.) can reuse the exact same recursive core for their
 * own children without importing this module back (would create an
 * import cycle: this file -> registry -> container component -> this
 * file).
 */
export function BlockRenderer({ blocks }: { blocks: BlockNode[] }) {
  return <div data-testid="block-renderer">{renderBlockList(blocks)}</div>;
}
