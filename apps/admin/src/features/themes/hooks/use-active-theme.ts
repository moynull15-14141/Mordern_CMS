'use client';

import { useQuery } from '@tanstack/react-query';
import { themesApi } from '../services/themes.api';
import { themesKeys } from './query-keys';

/** `GET /themes/active` — 404s (`ApiError.isNotFound`) when no theme is
 * active yet; callers render that as an empty state, not an error. */
export function useActiveTheme() {
  return useQuery({
    queryKey: themesKeys.active(),
    queryFn: () => themesApi.getActive(),
    retry: false,
  });
}
