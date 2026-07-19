'use client';

import { useQuery } from '@tanstack/react-query';
import { layoutsApi } from '../services/layouts.api';
import type { LayoutFilters } from '../types/layout';
import { layoutsKeys } from './query-keys';

/** `GET /layouts` — server-driven pagination/filter/sort/search, gated by
 * `layout.manage`. */
export function useLayouts(filters: LayoutFilters) {
  return useQuery({
    queryKey: layoutsKeys.list(filters),
    queryFn: () => layoutsApi.list(filters),
  });
}
