'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/categories.api';
import { categoriesKeys } from './query-keys';

/** `GET /categories/:id` — backs the Detail and Edit pages. */
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoriesKeys.detail(id),
    queryFn: () => categoriesApi.get(id),
    enabled: Boolean(id),
  });
}
