'use client';

import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../services/media.api';
import { mediaKeys } from './query-keys';

/** `GET /media/:id/usages` — backs the Detail page's "usage info" section. */
export function useMediaUsages(id: string) {
  return useQuery({
    queryKey: mediaKeys.usages(id),
    queryFn: () => mediaApi.getUsages(id),
    enabled: Boolean(id),
  });
}
