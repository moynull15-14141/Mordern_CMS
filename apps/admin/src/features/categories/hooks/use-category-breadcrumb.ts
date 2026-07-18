'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/categories.api';
import { categoriesKeys } from './query-keys';

/** `GET /categories/:id/breadcrumb` — root-to-self path, backs the Detail
 * page's "Breadcrumb preview". */
export function useCategoryBreadcrumb(id: string) {
  return useQuery({
    queryKey: categoriesKeys.breadcrumb(id),
    queryFn: () => categoriesApi.getBreadcrumb(id),
    enabled: Boolean(id),
  });
}
