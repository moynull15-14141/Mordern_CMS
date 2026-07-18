'use client';

import { useQuery } from '@tanstack/react-query';
import { commentsApi } from '../services/comments.api';
import type { CommentFilters } from '../types/comment';
import { commentsKeys } from './query-keys';

export function useUserComments(userId: string | undefined, filters: CommentFilters) {
  return useQuery({
    queryKey: commentsKeys.userComments(userId ?? '', filters),
    queryFn: () => commentsApi.userComments(userId as string, filters),
    enabled: Boolean(userId),
  });
}
