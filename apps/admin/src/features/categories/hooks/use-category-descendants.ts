'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/categories.api';
import { categoriesKeys } from './query-keys';

/** `GET /categories/:id/descendants` — used to exclude a category and its
 * own descendants from the Move dialog's parent selector (the backend is
 * itself "circular-reference safe" per `ArticlesController`'s comment;
 * this hook only improves the UX by not offering an invalid choice in the
 * first place). */
export function useCategoryDescendants(id: string) {
  return useQuery({
    queryKey: categoriesKeys.descendants(id),
    queryFn: () => categoriesApi.getDescendants(id),
    enabled: Boolean(id),
  });
}
