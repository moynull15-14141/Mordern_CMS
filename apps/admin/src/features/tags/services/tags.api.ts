import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { CreateTagInput, Tag, TagFilters, UpdateTagInput } from '../types/tag';

/** One function per real `TagsController` endpoint, verified directly
 * against `apps/backend/src/modules/categories/controllers/tags.controller.ts`.
 * No bulk endpoint exists. */
export const tagsApi = {
  list(filters: TagFilters): Promise<PaginatedResponse<Tag[]>> {
    return api.getPaginated<Tag[]>(API_ENDPOINTS.TAGS.ROOT, { params: filters });
  },

  getBySlug(slug: string): Promise<Tag> {
    return api.get<Tag>(API_ENDPOINTS.TAGS.bySlug(slug));
  },

  get(id: string): Promise<Tag> {
    return api.get<Tag>(API_ENDPOINTS.TAGS.byId(id));
  },

  create(input: CreateTagInput): Promise<Tag> {
    return api.post<Tag>(API_ENDPOINTS.TAGS.ROOT, input);
  },

  update(id: string, input: UpdateTagInput): Promise<Tag> {
    return api.patch<Tag>(API_ENDPOINTS.TAGS.byId(id), input);
  },

  remove(id: string): Promise<Tag> {
    return api.delete<Tag>(API_ENDPOINTS.TAGS.byId(id));
  },

  restore(id: string): Promise<Tag> {
    return api.post<Tag>(API_ENDPOINTS.TAGS.restore(id));
  },
};
