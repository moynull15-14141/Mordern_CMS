'use client';

import { useQuery } from '@tanstack/react-query';
import { commentsApi } from '../services/comments.api';
import { commentsKeys } from './query-keys';

export function useArticleCommentTree(articleId: string | undefined) {
  return useQuery({
    queryKey: commentsKeys.articleTree(articleId ?? ''),
    queryFn: () => commentsApi.articleTree(articleId as string),
    enabled: Boolean(articleId),
  });
}
