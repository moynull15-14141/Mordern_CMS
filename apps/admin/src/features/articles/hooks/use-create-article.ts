'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { articlesApi } from '../services/articles.api';
import type { CreateArticleInput } from '../types/article';
import { articlesKeys } from './query-keys';

/** `POST /articles` — `article.create`-gated. No `status` field exists on
 * the DTO; the created article starts in the backend's own default status. */
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateArticleInput) => articlesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success('Article created.');
    },
  });
}
