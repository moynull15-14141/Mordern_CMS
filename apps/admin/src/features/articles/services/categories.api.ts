import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { CategoryOption } from '../types/article';

/**
 * Only the one endpoint the Article Category selector needs
 * (`GET /categories/flat`) — a full Categories feature is out of this
 * milestone's scope. Every `CategoriesController` endpoint, including this
 * one, is gated by `category.create` (no `category.view` permission
 * exists) — a user with only `article.create` may get a 403 here; the
 * selector surfaces that via the normal query error state rather than
 * assuming it always succeeds (docs/65_FRONTEND_ARTICLES.md "Known
 * Limitations").
 */
export const categoriesApi = {
  listFlat(): Promise<CategoryOption[]> {
    return api.get<CategoryOption[]>(API_ENDPOINTS.CATEGORIES.FLAT);
  },
};
