import type { BlockType } from './block.types';

/** Mirrors `PublicReusableBlockResponseDto`
 * (`apps/backend/src/modules/content-blocks/dto/public-reusable-block-response.dto.ts`). */
export interface PublicReusableBlock {
  id: string;
  blockType: BlockType;
  data: Record<string, unknown>;
}
