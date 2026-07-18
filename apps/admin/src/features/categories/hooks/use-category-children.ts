'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/categories.api';
import { categoriesKeys } from './query-keys';

/** `GET /categories/:id/children` — backs the Detail page's direct-children
 * list ("Children count" relation). */
export function useCategoryChildren(id: string) {
  return useQuery({
    queryKey: categoriesKeys.children(id),
    queryFn: () => categoriesApi.getChildren(id),
    enabled: Boolean(id),
  });
}
