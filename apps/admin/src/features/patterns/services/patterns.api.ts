import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  CreatePatternInput,
  Pattern,
  PatternFilters,
  PatternSummary,
  PatternUsageReference,
  UpdatePatternInput,
} from '../types/pattern';

/** One function per real `PatternsController`/`PatternFavoritesController`
 * endpoint, verified directly against
 * `apps/backend/src/modules/patterns/controllers/*.controller.ts`. Unlike
 * `reusableBlocksApi.duplicate` (which composes `create` client-side —
 * no backend route exists for it), `duplicate` here is a real endpoint
 * (`POST /patterns/:id/duplicate`) since the Pattern Library spec
 * explicitly calls out Duplicate as a first-class capability. */
export const patternsApi = {
  list(filters: PatternFilters): Promise<PaginatedResponse<PatternSummary[]>> {
    return api.getPaginated<PatternSummary[]>(API_ENDPOINTS.PATTERNS.ROOT, { params: filters });
  },

  get(id: string): Promise<Pattern> {
    return api.get<Pattern>(API_ENDPOINTS.PATTERNS.byId(id));
  },

  create(input: CreatePatternInput): Promise<Pattern> {
    return api.post<Pattern>(API_ENDPOINTS.PATTERNS.ROOT, input);
  },

  update(id: string, input: UpdatePatternInput): Promise<Pattern> {
    return api.patch<Pattern>(API_ENDPOINTS.PATTERNS.byId(id), input);
  },

  duplicate(id: string): Promise<Pattern> {
    return api.post<Pattern>(API_ENDPOINTS.PATTERNS.duplicate(id));
  },

  archive(id: string): Promise<Pattern> {
    return api.post<Pattern>(API_ENDPOINTS.PATTERNS.archive(id));
  },

  unarchive(id: string): Promise<Pattern> {
    return api.post<Pattern>(API_ENDPOINTS.PATTERNS.unarchive(id));
  },

  remove(id: string): Promise<Pattern> {
    return api.delete<Pattern>(API_ENDPOINTS.PATTERNS.byId(id));
  },

  restore(id: string): Promise<Pattern> {
    return api.post<Pattern>(API_ENDPOINTS.PATTERNS.restore(id));
  },

  getUsages(id: string): Promise<PatternUsageReference[]> {
    return api.get<PatternUsageReference[]>(API_ENDPOINTS.PATTERNS.usages(id));
  },

  listFavorites(): Promise<PatternSummary[]> {
    return api.get<PatternSummary[]>(API_ENDPOINTS.PATTERNS.favorites);
  },

  addFavorite(id: string): Promise<void> {
    return api.post<void>(API_ENDPOINTS.PATTERNS.favorite(id));
  },

  removeFavorite(id: string): Promise<void> {
    return api.delete<void>(API_ENDPOINTS.PATTERNS.favorite(id));
  },
};
