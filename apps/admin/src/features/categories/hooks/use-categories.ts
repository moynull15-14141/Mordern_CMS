'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/categories.api';
import type { CategoryFilters } from '../types/category';
import { categoriesKeys } from './query-keys';

/** `GET /categories` — server-driven pagination/filter/sort/search.
 * `enabled` lets `CategoriesPageContent` skip this request entirely while
 * the Tree view is active (and vice versa for `useCategoryTree`) — the two
 * views never need both result sets at once. */
export function useCategories(filters: CategoryFilters, enabled = true) {
  return useQuery({
    queryKey: categoriesKeys.list(filters),
    queryFn: () => categoriesApi.list(filters),
    enabled,
  });
}
