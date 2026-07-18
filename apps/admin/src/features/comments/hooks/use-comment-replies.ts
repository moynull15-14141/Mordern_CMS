'use client';

import { useQuery } from '@tanstack/react-query';
import { commentsApi } from '../services/comments.api';
import type { CommentFilters } from '../types/comment';
import { commentsKeys } from './query-keys';

export function useCommentReplies(commentId: string | undefined, filters: CommentFilters) {
  return useQuery({
    queryKey: commentsKeys.replies(commentId ?? '', filters),
    queryFn: () => commentsApi.replies(commentId as string, filters),
    enabled: Boolean(commentId),
  });
}
