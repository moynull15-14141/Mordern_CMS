import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface BulkActionResult {
  succeeded: string[];
  failed: { id: string; reason: string }[];
}

/**
 * One function per real `MediaBulkController` endpoint (Milestone 5) —
 * real batch backend calls, not N sequential single-item requests. No
 * bulk-select UI existed anywhere in this admin app before this milestone
 * (confirmed by full grep); this is the service layer it's built on.
 */
export const mediaBulkApi = {
  move(ids: string[], folderId?: string): Promise<BulkActionResult> {
    return api.post<BulkActionResult>(API_ENDPOINTS.MEDIA.bulkMove, { ids, folderId });
  },
  archive(ids: string[]): Promise<BulkActionResult> {
    return api.post<BulkActionResult>(API_ENDPOINTS.MEDIA.bulkArchive, { ids });
  },
  unarchive(ids: string[]): Promise<BulkActionResult> {
    return api.post<BulkActionResult>(API_ENDPOINTS.MEDIA.bulkUnarchive, { ids });
  },
  restore(ids: string[]): Promise<BulkActionResult> {
    return api.post<BulkActionResult>(API_ENDPOINTS.MEDIA.bulkRestore, { ids });
  },
  remove(ids: string[]): Promise<BulkActionResult> {
    return api.post<BulkActionResult>(API_ENDPOINTS.MEDIA.bulkDelete, { ids });
  },
  /** Requires the asset already be soft-deleted ("Trash, then Purge") — `confirm: true` is a deliberate extra safety rail. */
  permanentDelete(id: string): Promise<void> {
    return api.delete<void>(API_ENDPOINTS.MEDIA.permanentDelete(id), { data: { confirm: true } });
  },
};
