import type { BlockComponentProps, BlockNode } from '../types/block.types';
import { renderBlockList } from '../render-block-list';
import { getReusableBlock } from '../../services/content-blocks.service';

/**
 * Async Server Component — resolves its `data.reusableBlockId` via
 * `content-blocks.service.ts`'s `cache()`-wrapped `getReusableBlock`
 * (request-level caching: the same id referenced twice in one render
 * fetches once), then delegates to `renderBlockList` (the same recursive
 * core every container block reuses for its own children) instead of
 * doing its own registry lookup — a reusable block is "one more block,
 * resolved from a different source," not a special case with its own
 * rendering path.
 *
 * A missing/deleted reference (`getReusableBlock` resolves `null`) or a
 * reusable block whose own type is *also* `reusable-block` (would recurse
 * forever — nothing in this codebase prevents authoring that today, since
 * the admin Reusable Blocks UI doesn't exist yet) both degrade to
 * rendering nothing, matching this module's "invalid/dangling reference →
 * render nothing, never throw" convention throughout.
 */
export async function ReusableBlockRenderer({ block }: BlockComponentProps) {
  const reusableBlockId =
    typeof block.data.reusableBlockId === 'string' ? block.data.reusableBlockId : '';
  if (!reusableBlockId) return null;

  const resolved = await getReusableBlock(reusableBlockId);
  if (!resolved || resolved.blockType === 'reusable-block') return null;

  const resolvedNode: BlockNode = {
    id: resolved.id,
    type: resolved.blockType,
    data: resolved.data,
  };
  return renderBlockList([resolvedNode]);
}
