'use client';

import { useQuery } from '@tanstack/react-query';
import { commentsApi } from '../services/comments.api';
import type { CommentFilters } from '../types/comment';
import { commentsKeys } from './query-keys';

export function useComments(filters: CommentFilters) {
  return useQuery({ queryKey: commentsKeys.list(filters), queryFn: () => commentsApi.list(filters) });
}
