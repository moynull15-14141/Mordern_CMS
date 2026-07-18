import { resourceKeys } from '@/constants/query-keys';
import type { SettingCategory } from '../types/settings';

/**
 * Settings has no id-scoped resource the way Users does — its two real
 * sub-resources are "by category" and "by key" (`SettingsController`'s
 * only two GET sub-routes beyond the flat list). `category`/`key` replace
 * the generic `detail(id)` shape from `resourceKeys()` since neither reads
 * naturally as an opaque id.
 */
const base = resourceKeys('settings');

export const settingsKeys = {
  all: base.all,
  lists: base.lists,
  categories: () => ['settings', 'category'] as const,
  category: (category: SettingCategory) => ['settings', 'category', category] as const,
  keys: () => ['settings', 'key'] as const,
  key: (key: string) => ['settings', 'key', key] as const,
};
