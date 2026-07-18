import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  CopyMediaMetadataInput,
  CreateMediaAssetInput,
  Media,
  MediaFilters,
  MediaUsageReference,
  MoveMediaAssetInput,
  RenameMediaAssetInput,
  UpdateMediaAssetInput,
} from '../types/media';

/**
 * One function per real `MediaController` endpoint, verified directly
 * against `apps/backend/src/modules/media/controllers/media.controller.ts`.
 * `create()` registers metadata only — no file bytes are transferred by
 * this or any other endpoint (the DTO's own comment: "NO upload engine");
 * see docs/67_FRONTEND_MEDIA.md. No bulk endpoint exists.
 */
export const mediaApi = {
  list(filters: MediaFilters, signal?: AbortSignal): Promise<PaginatedResponse<Media[]>> {
    return api.getPaginated<Media[]>(API_ENDPOINTS.MEDIA.ROOT, { params: filters, signal });
  },

  get(id: string): Promise<Media> {
    return api.get<Media>(API_ENDPOINTS.MEDIA.byId(id));
  },

  getUsages(id: string): Promise<MediaUsageReference[]> {
    return api.get<MediaUsageReference[]>(API_ENDPOINTS.MEDIA.usages(id));
  },

  getDuplicates(id: string): Promise<Media[]> {
    return api.get<Media[]>(API_ENDPOINTS.MEDIA.duplicates(id));
  },

  create(input: CreateMediaAssetInput, signal?: AbortSignal): Promise<Media> {
    return api.post<Media>(API_ENDPOINTS.MEDIA.ROOT, input, { signal });
  },

  update(id: string, input: UpdateMediaAssetInput): Promise<Media> {
    return api.patch<Media>(API_ENDPOINTS.MEDIA.byId(id), input);
  },

  rename(id: string, input: RenameMediaAssetInput): Promise<Media> {
    return api.post<Media>(API_ENDPOINTS.MEDIA.rename(id), input);
  },

  move(id: string, input: MoveMediaAssetInput): Promise<Media> {
    return api.post<Media>(API_ENDPOINTS.MEDIA.move(id), input);
  },

  copyMetadata(id: string, input: CopyMediaMetadataInput): Promise<Media> {
    return api.post<Media>(API_ENDPOINTS.MEDIA.copyMetadata(id), input);
  },

  remove(id: string): Promise<Media> {
    return api.delete<Media>(API_ENDPOINTS.MEDIA.byId(id));
  },

  restore(id: string): Promise<Media> {
    return api.post<Media>(API_ENDPOINTS.MEDIA.restore(id));
  },
};
