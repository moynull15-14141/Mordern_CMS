import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { Media } from '../types/media';

/**
 * One function per real `MediaFavoritesController` endpoint (Milestone 5)
 * — Favorites (per-user), Recent (per-user, bounded log), Pinned
 * (global/site-wide) are three genuinely different features, not one
 * personal-bookmark list under three names.
 */
export const mediaFavoritesApi = {
  listFavorites(): Promise<Media[]> {
    return api.get<Media[]>(API_ENDPOINTS.MEDIA.favorites);
  },
  addFavorite(id: string): Promise<void> {
    return api.post<void>(API_ENDPOINTS.MEDIA.favorite(id));
  },
  removeFavorite(id: string): Promise<void> {
    return api.delete<void>(API_ENDPOINTS.MEDIA.favorite(id));
  },
  listRecent(): Promise<Media[]> {
    return api.get<Media[]>(API_ENDPOINTS.MEDIA.recent);
  },
  recordView(id: string): Promise<void> {
    return api.post<void>(API_ENDPOINTS.MEDIA.recordView(id));
  },
  listPinned(): Promise<Media[]> {
    return api.get<Media[]>(API_ENDPOINTS.MEDIA.pinned);
  },
  pin(id: string): Promise<Media> {
    return api.post<Media>(API_ENDPOINTS.MEDIA.pin(id));
  },
  unpin(id: string): Promise<Media> {
    return api.delete<Media>(API_ENDPOINTS.MEDIA.pin(id));
  },
};
