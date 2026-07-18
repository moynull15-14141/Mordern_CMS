'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/categories.api';
import { categoriesKeys } from './query-keys';

/** `GET /categories/flat` — powers the parent-category selector. */
export function useCategoryFlat() {
  return useQuery({
    queryKey: categoriesKeys.flat(),
    queryFn: () => categoriesApi.getFlat(),
  });
}
