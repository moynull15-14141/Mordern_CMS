'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { commentsApi } from '../services/comments.api';
import { commentsKeys } from './query-keys';

export function useRestoreComment(articleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commentsApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: commentsKeys.lists() });
      if (articleId) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'article', articleId] });
      }
      toast.success('Comment restored.');
    },
  });
}
