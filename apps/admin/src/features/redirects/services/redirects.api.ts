import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  CreateRedirectInput,
  Redirect,
  RedirectFilters,
  UpdateRedirectInput,
} from '../types/redirect';

/** One function per real `RedirectsController` endpoint, verified against
 * `apps/backend/src/modules/redirects/controllers/redirects.controller.ts`. */
export const redirectsApi = {
  list(filters: RedirectFilters): Promise<PaginatedResponse<Redirect[]>> {
    return api.getPaginated<Redirect[]>(API_ENDPOINTS.REDIRECTS.ROOT, { params: filters });
  },

  get(id: string): Promise<Redirect> {
    return api.get<Redirect>(API_ENDPOINTS.REDIRECTS.byId(id));
  },

  create(input: CreateRedirectInput): Promise<Redirect> {
    return api.post<Redirect>(API_ENDPOINTS.REDIRECTS.ROOT, input);
  },

  update(id: string, input: UpdateRedirectInput): Promise<Redirect> {
    return api.patch<Redirect>(API_ENDPOINTS.REDIRECTS.byId(id), input);
  },

  remove(id: string): Promise<Redirect> {
    return api.delete<Redirect>(API_ENDPOINTS.REDIRECTS.byId(id));
  },

  restore(id: string): Promise<Redirect> {
    return api.post<Redirect>(API_ENDPOINTS.REDIRECTS.restore(id));
  },
};
