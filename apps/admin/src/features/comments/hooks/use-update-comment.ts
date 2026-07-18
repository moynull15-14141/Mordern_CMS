'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { commentsApi } from '../services/comments.api';
import type { UpdateCommentInput } from '../types/comment';
import { commentsKeys } from './query-keys';

export function useUpdateComment(id: string, articleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCommentInput) => commentsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: commentsKeys.lists() });
      if (articleId) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'article', articleId] });
      }
      toast.success('Comment updated.');
    },
  });
}
