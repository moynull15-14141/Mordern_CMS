'use client';

import { useQuery } from '@tanstack/react-query';
import { themesApi } from '../services/themes.api';
import type { ThemeFilters } from '../types/theme';
import { themesKeys } from './query-keys';

/** `GET /themes` — server-driven pagination/filter/sort/search, gated by
 * `theme.manage`. */
export function useThemes(filters: ThemeFilters) {
  return useQuery({
    queryKey: themesKeys.list(filters),
    queryFn: () => themesApi.list(filters),
  });
}
