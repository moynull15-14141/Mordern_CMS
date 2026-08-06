import type { BlockNode } from '../types/block.types';

/** Mirrors `ReusableBlockResponseDto`
 * (`apps/backend/src/modules/content-blocks/dto/reusable-block-response.dto.ts`). */
export interface ReusableBlockSummary {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  blockType: string;
  data: unknown;
  children: BlockNode[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Mirrors `CreateReusableBlockDto`. */
export interface CreateReusableBlockFromEditorInput {
  name: string;
  description?: string;
  category?: string;
  blockType: string;
  data: Record<string, unknown>;
  children?: BlockNode[];
}
