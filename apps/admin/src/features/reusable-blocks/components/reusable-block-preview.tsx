import { BlockSummaryPreview } from '@/features/block-editor';
import type { ReusableBlock } from '../types/reusable-block';

export interface ReusableBlockPreviewProps {
  block: Pick<ReusableBlock, 'blockType' | 'data' | 'children'>;
  className?: string;
}

/** Thin adapter from a `ReusableBlock`'s field names (`blockType`) to the
 * Block Editor's generic `BlockSummaryPreview` (`type`) — reused as-is
 * across the management list, the Detail/Inspector page, and (via the
 * same underlying helper) the visual picker in the editor. */
export function ReusableBlockPreview({ block, className }: ReusableBlockPreviewProps) {
  return (
    <BlockSummaryPreview
      block={{ type: block.blockType, data: block.data, children: block.children }}
      className={className}
    />
  );
}
