'use client';

import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '../services/tags.api';
import type { TagFilters } from '../types/tag';
import { tagsKeys } from './query-keys';

/** `GET /tags` — server-driven pagination/search/sort. */
export function useTags(filters: TagFilters) {
  return useQuery({
    queryKey: tagsKeys.list(filters),
    queryFn: () => tagsApi.list(filters),
  });
}
