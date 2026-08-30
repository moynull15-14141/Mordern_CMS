import { resourceKeys } from '@/constants/query-keys';
import type { MenuFilters } from '../types/menu';

const base = resourceKeys('menus');

export const menusKeys = {
  ...base,
  list: (filters: MenuFilters) => [...base.lists(), filters] as const,
};
