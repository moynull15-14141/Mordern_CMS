'use client';

import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '../services/pages.api';
import type { PageFilters } from '../types/page';
import { pagesKeys } from './query-keys';

/** `GET /pages` — server-driven pagination/filter/sort/search, gated by
 * `page.manage`. */
export function usePages(filters: PageFilters) {
  return useQuery({
    queryKey: pagesKeys.list(filters),
    queryFn: () => pagesApi.list(filters),
  });
}
