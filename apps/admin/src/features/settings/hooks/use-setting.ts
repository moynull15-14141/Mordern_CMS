'use client';

import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../services/settings.api';
import { settingsKeys } from './query-keys';

/** `GET /settings/:key` — backs the Setting Details view. */
export function useSetting(key: string) {
  return useQuery({
    queryKey: settingsKeys.key(key),
    queryFn: () => settingsApi.getByKey(key),
    enabled: Boolean(key),
  });
}
