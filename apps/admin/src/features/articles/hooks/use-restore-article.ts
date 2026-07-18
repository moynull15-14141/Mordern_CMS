'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { articlesApi } from '../services/articles.api';
import { articlesKeys } from './query-keys';

/** `POST /articles/:id/restore` — reuses `article.delete` (no
 * `article.restore` permission exists). */
export function useRestoreArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success('Article restored.');
    },
  });
}
