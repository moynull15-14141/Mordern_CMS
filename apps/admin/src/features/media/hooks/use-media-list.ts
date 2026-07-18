'use client';

import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../services/media.api';
import type { MediaFilters } from '../types/media';
import { mediaKeys } from './query-keys';

/** `GET /media` — server-driven pagination/filter/sort/search, gated by
 * `RequireAnyPermission(media.upload|media.delete)`. */
export function useMediaList(filters: MediaFilters) {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: () => mediaApi.list(filters),
  });
}
