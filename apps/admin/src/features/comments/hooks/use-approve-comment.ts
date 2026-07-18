'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { commentsApi } from '../services/comments.api';
import type { ApproveCommentInput } from '../types/comment';
import { commentsKeys } from './query-keys';

export function useApproveComment(articleId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApproveCommentInput }) => commentsApi.approve(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: commentsKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: commentsKeys.lists() });
      if (articleId) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'article', articleId] });
      }
      toast.success('Comment approved.');
    },
  });
}
