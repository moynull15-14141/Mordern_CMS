'use client';

import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../services/settings.api';
import { settingsKeys } from './query-keys';

/** `GET /settings` — the complete, closed 34-entry catalog. No pagination,
 * search, or sort query params exist on the backend (docs/64_FRONTEND_SETTINGS.md
 * "Conflicts Discovered") — the Settings List's search/filter/sort happens
 * client-side over this one result set. */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.lists(),
    queryFn: () => settingsApi.getAll(),
  });
}
