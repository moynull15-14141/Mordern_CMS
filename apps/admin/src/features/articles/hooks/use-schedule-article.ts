'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { articlesApi } from '../services/articles.api';
import type { ScheduleArticleInput } from '../types/article';
import { articlesKeys } from './query-keys';

/** `POST /articles/:id/schedule` — `article.publish`-gated. */
export function useScheduleArticle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ScheduleArticleInput) => articlesApi.schedule(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success('Article scheduled.');
    },
  });
}
