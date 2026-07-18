'use client';

import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '../services/tags.api';
import { tagsKeys } from './query-keys';

/** `GET /tags/:id` — backs the Detail and Edit pages. */
export function useTag(id: string) {
  return useQuery({
    queryKey: tagsKeys.detail(id),
    queryFn: () => tagsApi.get(id),
    enabled: Boolean(id),
  });
}
