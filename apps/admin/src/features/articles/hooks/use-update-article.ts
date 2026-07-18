'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { articlesApi } from '../services/articles.api';
import type { UpdateArticleInput } from '../types/article';
import { articlesKeys } from './query-keys';

/** `PATCH /articles/:id` — `article.update`-gated, additionally
 * ownership-checked server-side (Owner/Editor/Administrator/Super Admin).
 * Pessimistic (mirrors `useUpdateUser`): no optimistic cache write. */
export function useUpdateArticle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateArticleInput) => articlesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success('Article updated.');
    },
  });
}
