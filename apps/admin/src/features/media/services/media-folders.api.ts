import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { MediaFolderTreeNode } from '../types/media';

/**
 * Only the one `MediaFolderController` endpoint the folder filter/picker
 * needs (`GET /media-folders/tree`) — full Folder CRUD (create/rename/
 * move/delete folders themselves) is real but out of this milestone's
 * requested pages (`/media`, `/media/upload`, `/media/[id]` only); see
 * docs/67_FRONTEND_MEDIA.md "Known Limitations". Same scope shape as
 * `features/articles/services/categories.api.ts` in Frontend Milestone 5.
 */
export const mediaFoldersApi = {
  getTree(): Promise<MediaFolderTreeNode[]> {
    return api.get<MediaFolderTreeNode[]>(API_ENDPOINTS.MEDIA_FOLDERS.TREE);
  },
};
