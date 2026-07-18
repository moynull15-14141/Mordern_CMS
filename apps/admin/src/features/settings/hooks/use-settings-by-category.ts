'use client';

import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../services/settings.api';
import type { SettingCategory } from '../types/settings';
import { settingsKeys } from './query-keys';

/** `GET /settings/category/:category` — backs the per-category edit page. */
export function useSettingsByCategory(category: SettingCategory) {
  return useQuery({
    queryKey: settingsKeys.category(category),
    queryFn: () => settingsApi.getByCategory(category),
  });
}
