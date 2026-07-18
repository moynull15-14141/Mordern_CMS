'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { seoApi } from '../services/seo.api';
import type { SeoEntityType, UpdateSeoInput } from '../types/seo';
import { seoKeys } from './query-keys';

/** `PATCH /seo/:id` — the only write path this module exposes (no
 * `create`/`upsert`, since those require a `siteId` the frontend has no
 * real way to resolve; see docs/68_FRONTEND_SEO.md "Remaining Backend
 * Limitations"). Operates on a `SeoMeta` row already linked to an
 * article/category. */
export function useUpdateSeo(id: string, entityType: SeoEntityType, entityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSeoInput) => seoApi.update(id, input),
    onSuccess: () => {
      const key =
        entityType === 'article' ? seoKeys.forArticle(entityId) : seoKeys.forCategory(entityId);
      queryClient.invalidateQueries({ queryKey: key });
      toast.success('SEO settings saved.');
    },
  });
}
