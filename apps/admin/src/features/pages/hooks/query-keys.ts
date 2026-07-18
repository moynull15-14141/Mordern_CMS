import { resourceKeys } from '@/constants/query-keys';
import type { PageFilters } from '../types/page';

const base = resourceKeys('pages');

export const pagesKeys = {
  ...base,
  list: (filters: PageFilters) => [...base.lists(), filters] as const,
};
