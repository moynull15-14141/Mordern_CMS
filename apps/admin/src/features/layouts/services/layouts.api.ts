import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { CreateLayoutInput, Layout, LayoutFilters, UpdateLayoutInput } from '../types/layout';

/** One function per real `LayoutsController` endpoint, verified directly
 * against `apps/backend/src/modules/layouts/controllers/layouts.controller.ts`.
 * No `bySlug`/`activate` endpoint exists (mirrors `themesApi`'s own "no
 * bySlug" note — unlike Theme, Layout has no singleton "active" concept
 * at all). */
export const layoutsApi = {
  list(filters: LayoutFilters): Promise<PaginatedResponse<Layout[]>> {
    return api.getPaginated<Layout[]>(API_ENDPOINTS.LAYOUTS.ROOT, { params: filters });
  },

  get(id: string): Promise<Layout> {
    return api.get<Layout>(API_ENDPOINTS.LAYOUTS.byId(id));
  },

  create(input: CreateLayoutInput): Promise<Layout> {
    return api.post<Layout>(API_ENDPOINTS.LAYOUTS.ROOT, input);
  },

  update(id: string, input: UpdateLayoutInput): Promise<Layout> {
    return api.patch<Layout>(API_ENDPOINTS.LAYOUTS.byId(id), input);
  },

  remove(id: string): Promise<Layout> {
    return api.delete<Layout>(API_ENDPOINTS.LAYOUTS.byId(id));
  },

  restore(id: string): Promise<Layout> {
    return api.post<Layout>(API_ENDPOINTS.LAYOUTS.restore(id));
  },
};
