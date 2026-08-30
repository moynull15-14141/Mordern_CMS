import { resourceKeys } from '@/constants/query-keys';
import type { RedirectFilters } from '../types/redirect';

const base = resourceKeys('redirects');

export const redirectsKeys = {
  ...base,
  list: (filters: RedirectFilters) => [...base.lists(), filters] as const,
};
