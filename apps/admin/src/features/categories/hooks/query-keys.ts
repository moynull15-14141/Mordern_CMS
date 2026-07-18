import { resourceKeys } from '@/constants/query-keys';
import type { CategoryFilters } from '../types/category';

const base = resourceKeys('categories');

export const categoriesKeys = {
  ...base,
  list: (filters: CategoryFilters) => [...base.lists(), filters] as const,
  tree: () => ['categories', 'tree'] as const,
  flat: () => ['categories', 'flat'] as const,
  children: (id: string) => ['categories', id, 'children'] as const,
  descendants: (id: string) => ['categories', id, 'descendants'] as const,
  breadcrumb: (id: string) => ['categories', id, 'breadcrumb'] as const,
};
