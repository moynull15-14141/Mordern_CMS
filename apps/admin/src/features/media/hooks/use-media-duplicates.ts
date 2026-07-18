'use client';

import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../services/media.api';
import { mediaKeys } from './query-keys';

/** `GET /media/:id/duplicates` — heuristic (same mimeType + filesize),
 * backs the Detail page's "Possible duplicates" section. */
export function useMediaDuplicates(id: string) {
  return useQuery({
    queryKey: mediaKeys.duplicates(id),
    queryFn: () => mediaApi.getDuplicates(id),
    enabled: Boolean(id),
  });
}
