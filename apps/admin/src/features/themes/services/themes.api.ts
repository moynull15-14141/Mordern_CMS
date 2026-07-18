import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { CreateThemeInput, Theme, ThemeFilters, UpdateThemeInput } from '../types/theme';

/** One function per real `ThemesController` endpoint, verified directly
 * against `apps/backend/src/modules/themes/controllers/themes.controller.ts`.
 * No bulk endpoint, no `bySlug` lookup exists on this controller. */
export const themesApi = {
  list(filters: ThemeFilters): Promise<PaginatedResponse<Theme[]>> {
    return api.getPaginated<Theme[]>(API_ENDPOINTS.THEMES.ROOT, { params: filters });
  },

  getActive(): Promise<Theme> {
    return api.get<Theme>(API_ENDPOINTS.THEMES.ACTIVE);
  },

  get(id: string): Promise<Theme> {
    return api.get<Theme>(API_ENDPOINTS.THEMES.byId(id));
  },

  create(input: CreateThemeInput): Promise<Theme> {
    return api.post<Theme>(API_ENDPOINTS.THEMES.ROOT, input);
  },

  update(id: string, input: UpdateThemeInput): Promise<Theme> {
    return api.patch<Theme>(API_ENDPOINTS.THEMES.byId(id), input);
  },

  remove(id: string): Promise<Theme> {
    return api.delete<Theme>(API_ENDPOINTS.THEMES.byId(id));
  },

  restore(id: string): Promise<Theme> {
    return api.post<Theme>(API_ENDPOINTS.THEMES.restore(id));
  },

  activate(id: string): Promise<Theme> {
    return api.post<Theme>(API_ENDPOINTS.THEMES.activate(id));
  },
};
