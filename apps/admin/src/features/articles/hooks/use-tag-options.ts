'use client';

import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '../services/tags.api';
import { tagOptionsKeys } from './query-keys';

/** `GET /tags` — powers the Article form's Tag multi-select. */
export function useTagOptions(search?: string) {
  return useQuery({
    queryKey: tagOptionsKeys.list(search),
    queryFn: () => tagsApi.list(search),
  });
}
