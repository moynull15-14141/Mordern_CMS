/** Mirrors `ReusableBlockResponseDto`
 * (`apps/backend/src/modules/content-blocks/dto/reusable-block-response.dto.ts`). */
export interface ReusableBlockSummary {
  id: string;
  name: string;
  blockType: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
