import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  CreateReusableBlockFromEditorInput,
  ReusableBlockSummary,
} from './reusable-block.types';

/** One function per `ReusableBlocksController` endpoint this feature
 * itself needs — the picker's list/search, plus `get`/`create` for the
 * "Save as Reusable"/"Detach copy" flows (`components/property-panel/`).
 * The full CRUD surface (update/delete/restore/usages) lives in the
 * dedicated `features/reusable-blocks` library management module, not
 * here — this feature only ever creates or reads, never edits/deletes a
 * library entry from inside the editor. Verified directly against
 * `apps/backend/src/modules/content-blocks/controllers/reusable-blocks.controller.ts`. */
export const reusableBlocksApi = {
  list(search?: string): Promise<PaginatedResponse<ReusableBlockSummary[]>> {
    return api.getPaginated<ReusableBlockSummary[]>(API_ENDPOINTS.CONTENT_BLOCKS.REUSABLE_ROOT, {
      params: { search, limit: 50 },
    });
  },

  get(id: string): Promise<ReusableBlockSummary> {
    return api.get<ReusableBlockSummary>(API_ENDPOINTS.CONTENT_BLOCKS.reusableById(id));
  },

  create(input: CreateReusableBlockFromEditorInput): Promise<ReusableBlockSummary> {
    return api.post<ReusableBlockSummary>(API_ENDPOINTS.CONTENT_BLOCKS.REUSABLE_ROOT, input);
  },
};
