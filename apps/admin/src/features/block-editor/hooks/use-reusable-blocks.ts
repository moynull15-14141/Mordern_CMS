'use client';

import { useQuery } from '@tanstack/react-query';
import { reusableBlocksApi } from '../api/reusable-blocks.api';

const reusableBlockKeys = {
  list: (search?: string) => ['block-editor', 'reusable-blocks', search ?? ''] as const,
};

/** `GET /content-blocks/reusable` — powers `ReusableBlockRefField`'s picker. */
export function useReusableBlocks(search?: string) {
  return useQuery({
    queryKey: reusableBlockKeys.list(search),
    queryFn: () => reusableBlocksApi.list(search),
  });
}
