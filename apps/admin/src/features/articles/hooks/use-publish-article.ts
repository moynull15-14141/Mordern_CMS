'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { articlesApi } from '../services/articles.api';
import { articlesKeys } from './query-keys';

/** `POST /articles/:id/publish` — `article.publish`-gated (editorial tier,
 * not ownership-checked). */
export function usePublishArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.publish(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success('Article published.');
    },
  });
}
