'use client';

import { useQuery } from '@tanstack/react-query';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import type { ReusableBlockFilters } from '../types/reusable-block';
import { reusableBlocksKeys } from './query-keys';

/** `GET /content-blocks/reusable` — server-driven pagination/filter/sort/
 * search, gated by `page.manage`. */
export function useReusableBlocks(filters: ReusableBlockFilters) {
  return useQuery({
    queryKey: reusableBlocksKeys.list(filters),
    queryFn: () => reusableBlocksApi.list(filters),
  });
}
