'use client';

import { useQuery } from '@tanstack/react-query';
import { seoApi } from '../services/seo.api';
import type { SeoEntityType } from '../types/seo';
import { seoKeys } from './query-keys';

/** `GET /seo/article/:id` or `GET /seo/category/:id` — there is no
 * generic "SEO for entity" endpoint, so the two real lookups are unified
 * behind one hook keyed by `entityType`. 404 (`ApiError.isNotFound`) means
 * the entity has never had SEO fields saved yet — expected, not an error
 * state, handled by the caller. */
export function useSeoForEntity(entityType: SeoEntityType, entityId: string) {
  return useQuery({
    queryKey:
      entityType === 'article' ? seoKeys.forArticle(entityId) : seoKeys.forCategory(entityId),
    queryFn: () =>
      entityType === 'article' ? seoApi.getForArticle(entityId) : seoApi.getForCategory(entityId),
    enabled: Boolean(entityId),
    retry: false,
  });
}
