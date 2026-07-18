'use client';

import { useQuery } from '@tanstack/react-query';
import { commentsApi } from '../services/comments.api';
import type { CommentFilters } from '../types/comment';
import { commentsKeys } from './query-keys';

export function useArticleComments(articleId: string | undefined, filters: CommentFilters) {
  return useQuery({
    queryKey: commentsKeys.articleComments(articleId ?? '', filters),
    queryFn: () => commentsApi.articleComments(articleId as string, filters),
    enabled: Boolean(articleId),
  });
}
