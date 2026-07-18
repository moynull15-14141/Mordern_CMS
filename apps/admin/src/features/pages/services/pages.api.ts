import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { CreatePageInput, Page, PageFilters, UpdatePageInput } from '../types/page';

/** One function per real `PagesController` endpoint, verified directly
 * against `apps/backend/src/modules/pages/controllers/pages.controller.ts`.
 * No bulk endpoint, no `/schedule` endpoint exists. */
export const pagesApi = {
  list(filters: PageFilters): Promise<PaginatedResponse<Page[]>> {
    return api.getPaginated<Page[]>(API_ENDPOINTS.PAGES.ROOT, { params: filters });
  },

  get(id: string): Promise<Page> {
    return api.get<Page>(API_ENDPOINTS.PAGES.byId(id));
  },

  getBySlug(slug: string): Promise<Page> {
    return api.get<Page>(API_ENDPOINTS.PAGES.bySlug(slug));
  },

  create(input: CreatePageInput): Promise<Page> {
    return api.post<Page>(API_ENDPOINTS.PAGES.ROOT, input);
  },

  update(id: string, input: UpdatePageInput): Promise<Page> {
    return api.patch<Page>(API_ENDPOINTS.PAGES.byId(id), input);
  },

  remove(id: string): Promise<Page> {
    return api.delete<Page>(API_ENDPOINTS.PAGES.byId(id));
  },

  restore(id: string): Promise<Page> {
    return api.post<Page>(API_ENDPOINTS.PAGES.restore(id));
  },

  publish(id: string): Promise<Page> {
    return api.post<Page>(API_ENDPOINTS.PAGES.publish(id));
  },
};
