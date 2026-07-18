import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { TagOption } from '../types/article';

/**
 * Only the one endpoint the Article Tag selector needs (`GET /tags`) — a
 * full Tags feature is out of this milestone's scope. `TagsController` is
 * gated by `category.create` (no `tag.*` permission exists at all — see
 * the backend's own comment on that controller), same caveat as
 * `categoriesApi`.
 */
export const tagsApi = {
  list(search?: string): Promise<PaginatedResponse<TagOption[]>> {
    return api.getPaginated<TagOption[]>(API_ENDPOINTS.TAGS.ROOT, {
      params: { search, page: 1, limit: 100 },
    });
  },
};
