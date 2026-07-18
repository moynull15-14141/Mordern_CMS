'use client';

import { useQuery } from '@tanstack/react-query';
import { commentsApi } from '../services/comments.api';
import { commentsKeys } from './query-keys';

export function useComment(id: string | undefined) {
  return useQuery({
    queryKey: commentsKeys.detail(id ?? ''),
    queryFn: () => commentsApi.get(id as string),
    enabled: Boolean(id),
  });
}
