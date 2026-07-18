'use client';

import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '../services/articles.api';
import { articlesKeys } from './query-keys';

/** `GET /articles/:id` — backs the Detail and Edit pages. */
export function useArticle(id: string) {
  return useQuery({
    queryKey: articlesKeys.detail(id),
    queryFn: () => articlesApi.get(id),
    enabled: Boolean(id),
  });
}
