'use client';

import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '../services/articles.api';
import type { ArticleFilters } from '../types/article';
import { articlesKeys } from './query-keys';

/** `GET /articles` — server-driven pagination/filter/sort/search, gated by
 * `RequireAnyPermission(article.create|update|delete|publish)`. */
export function useArticles(filters: ArticleFilters) {
  return useQuery({
    queryKey: articlesKeys.list(filters),
    queryFn: () => articlesApi.list(filters),
  });
}
