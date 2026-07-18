'use client';

import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../services/media.api';
import { mediaKeys } from './query-keys';

/** `GET /media/:id` — backs the Detail page. */
export function useMedia(id: string) {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: () => mediaApi.get(id),
    enabled: Boolean(id),
  });
}
