'use client';

import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '../services/articles.api';
import { articlesKeys } from './query-keys';

/** `GET /articles/:id/revisions` — backs the Detail page's "Revision
 * summary" (list only; no diff viewer in this milestone's scope — the
 * backend's own `/revisions/compare` returns metadata, not a visual diff). */
export function useArticleRevisions(id: string) {
  return useQuery({
    queryKey: articlesKeys.revisions(id),
    queryFn: () => articlesApi.listRevisions(id),
    enabled: Boolean(id),
  });
}
