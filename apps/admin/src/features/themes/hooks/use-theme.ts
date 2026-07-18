'use client';

import { useQuery } from '@tanstack/react-query';
import { themesApi } from '../services/themes.api';
import { themesKeys } from './query-keys';

/** `GET /themes/:id` — backs the Detail and Edit pages. */
export function useTheme(id: string) {
  return useQuery({
    queryKey: themesKeys.detail(id),
    queryFn: () => themesApi.get(id),
    enabled: Boolean(id),
  });
}
