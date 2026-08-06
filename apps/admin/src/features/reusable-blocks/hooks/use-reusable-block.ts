'use client';

import { useQuery } from '@tanstack/react-query';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import { reusableBlocksKeys } from './query-keys';

/** `GET /content-blocks/reusable/:id` — backs the Detail and Edit pages. */
export function useReusableBlock(id: string) {
  return useQuery({
    queryKey: reusableBlocksKeys.detail(id),
    queryFn: () => reusableBlocksApi.get(id),
    enabled: Boolean(id),
  });
}
