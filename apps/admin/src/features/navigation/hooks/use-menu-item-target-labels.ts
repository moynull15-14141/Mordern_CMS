'use client';

import { useQueries } from '@tanstack/react-query';
import { pagesApi } from '@/features/pages/services/pages.api';
import { pagesKeys } from '@/features/pages/hooks/query-keys';
import { articlesApi } from '@/features/articles/services/articles.api';
import { articlesKeys } from '@/features/articles/hooks/query-keys';
import { categoriesApi } from '@/features/categories/services/categories.api';
import { categoriesKeys } from '@/features/categories/hooks/query-keys';
import type { MenuItem } from '../types/menu';

function collectTargetIds(items: MenuItem[]) {
  const pageIds = new Set<string>();
  const articleIds = new Set<string>();
  const categoryIds = new Set<string>();
  function walk(nodes: MenuItem[]) {
    for (const node of nodes) {
      if (node.targetType === 'PAGE' && node.pageId) pageIds.add(node.pageId);
      if (node.targetType === 'ARTICLE' && node.articleId) articleIds.add(node.articleId);
      if (node.targetType === 'CATEGORY' && node.categoryId) categoryIds.add(node.categoryId);
      walk(node.children);
    }
  }
  walk(items);
  return { pageIds: [...pageIds], articleIds: [...articleIds], categoryIds: [...categoryIds] };
}

/**
 * Resolves every Page/Article/Category a menu's items point to into a
 * real display title — the tree editor must never show a raw id (spec
 * requirement). Reuses each module's own real `GET /:resource/:id`
 * endpoint and query key (so results share the cache with the rest of
 * the app) rather than fetching a full list to extract a few rows. A
 * navigation menu realistically has a handful of items, so this is a
 * small, bounded, one-time set of already-cacheable single-entity
 * lookups — not the unbounded per-row fetch "N+1" describes.
 */
export function useMenuItemTargetLabels(items: MenuItem[]) {
  const { pageIds, articleIds, categoryIds } = collectTargetIds(items);

  const pageQueries = useQueries({
    queries: pageIds.map((id) => ({
      queryKey: pagesKeys.detail(id),
      queryFn: () => pagesApi.get(id),
    })),
  });
  const articleQueries = useQueries({
    queries: articleIds.map((id) => ({
      queryKey: articlesKeys.detail(id),
      queryFn: () => articlesApi.get(id),
    })),
  });
  const categoryQueries = useQueries({
    queries: categoryIds.map((id) => ({
      queryKey: categoriesKeys.detail(id),
      queryFn: () => categoriesApi.get(id),
    })),
  });

  const labels = new Map<string, string>();
  pageIds.forEach((id, index) => {
    const title = pageQueries[index]?.data?.title;
    if (title) labels.set(`PAGE:${id}`, title);
  });
  articleIds.forEach((id, index) => {
    const title = articleQueries[index]?.data?.title;
    if (title) labels.set(`ARTICLE:${id}`, title);
  });
  categoryIds.forEach((id, index) => {
    const name = categoryQueries[index]?.data?.name;
    if (name) labels.set(`CATEGORY:${id}`, name);
  });

  const isLoading =
    pageQueries.some((q) => q.isLoading) ||
    articleQueries.some((q) => q.isLoading) ||
    categoryQueries.some((q) => q.isLoading);

  return { labels, isLoading };
}
