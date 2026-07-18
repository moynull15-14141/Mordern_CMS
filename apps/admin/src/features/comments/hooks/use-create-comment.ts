'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { commentsApi } from '../services/comments.api';
import type { CreateCommentInput } from '../types/comment';
import { commentsKeys } from './query-keys';

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => commentsApi.create(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['comments', 'article', input.articleId] });
      toast.success('Comment created.');
    },
  });
}
