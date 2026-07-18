'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { articlesApi } from '../services/articles.api';
import { articlesKeys } from './query-keys';

/** `DELETE /articles/:id` — soft delete, `article.delete`-gated. */
export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success('Article deleted.');
    },
  });
}
