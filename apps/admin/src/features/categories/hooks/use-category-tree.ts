'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/categories.api';
import { categoriesKeys } from './query-keys';

/** `GET /categories/tree` — full nested tree, unlimited depth. `enabled`
 * lets `CategoriesPageContent` skip this request while the List view is
 * active — see `useCategories`' matching comment. */
export function useCategoryTree(enabled = true) {
  return useQuery({
    queryKey: categoriesKeys.tree(),
    queryFn: () => categoriesApi.getTree(),
    enabled,
  });
}
