import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { ReusableBlockSummary } from './reusable-block.types';

/** One function per real `ReusableBlocksController` endpoint this feature
 * uses today (read path only — the picker lists/searches existing
 * reusable blocks; creating/renaming/deleting them is a Reusable Blocks
 * library management page, noted as remaining work, not built in this
 * milestone). Verified directly against
 * `apps/backend/src/modules/content-blocks/controllers/reusable-blocks.controller.ts`. */
export const reusableBlocksApi = {
  list(search?: string): Promise<PaginatedResponse<ReusableBlockSummary[]>> {
    return api.getPaginated<ReusableBlockSummary[]>(API_ENDPOINTS.CONTENT_BLOCKS.REUSABLE_ROOT, {
      params: { search, limit: 50 },
    });
  },
};
