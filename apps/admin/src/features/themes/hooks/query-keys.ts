import { resourceKeys } from '@/constants/query-keys';
import type { ThemeFilters } from '../types/theme';

const base = resourceKeys('themes');

export const themesKeys = {
  ...base,
  list: (filters: ThemeFilters) => [...base.lists(), filters] as const,
  active: () => ['themes', 'active'] as const,
};
