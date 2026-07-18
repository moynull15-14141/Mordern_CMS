'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/categories.api';
import { categoryOptionsKeys } from './query-keys';

/** `GET /categories/flat` — powers the Article form's Category selector. */
export function useCategoryOptions() {
  return useQuery({
    queryKey: categoryOptionsKeys.flat(),
    queryFn: () => categoriesApi.listFlat(),
  });
}
