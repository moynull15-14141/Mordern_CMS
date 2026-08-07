'use client';

import { useQuery } from '@tanstack/react-query';
import { patternsApi } from '../services/patterns.api';
import { patternsKeys } from './query-keys';
import type { PatternFilters } from '../types/pattern';

/** `GET /patterns` — server-driven pagination/filter/sort/search. */
export function usePatterns(filters: PatternFilters) {
  return useQuery({
    queryKey: patternsKeys.list(filters),
    queryFn: () => patternsApi.list(filters),
  });
}

/** `GET /patterns/:id` — full shape, including the block tree. */
export function usePattern(id: string) {
  return useQuery({
    queryKey: patternsKeys.detail(id),
    queryFn: () => patternsApi.get(id),
    enabled: Boolean(id),
  });
}

/** `GET /patterns/:id/usages` — "Inserted From" provenance, not a live reference. */
export function usePatternUsages(id: string) {
  return useQuery({
    queryKey: patternsKeys.usages(id),
    queryFn: () => patternsApi.getUsages(id),
    enabled: Boolean(id),
  });
}
