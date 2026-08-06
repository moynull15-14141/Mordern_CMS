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
 * A missing/deleted reference (`getReusableBlock` resolves `null`) degrades
 * to rendering nothing, matching this module's "invalid/dangling reference
 * → render nothing, never throw" convention throughout. The backend now
 * rejects authoring a reusable block whose reference graph would cycle back
 * to itself (`ReusableBlockCycleValidator`, save-time) — the
 * `resolved.blockType === 'reusable-block'` check below is kept anyway as
 * defense-in-depth against stale/pre-migration data, not the primary guard.
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
    children: resolved.children,
  };
  return renderBlockList([resolvedNode]);
}
