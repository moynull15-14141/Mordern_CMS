import { resourceKeys } from '@/constants/query-keys';
import type { ReusableBlockFilters } from '../types/reusable-block';

const base = resourceKeys('reusable-blocks');

export const reusableBlocksKeys = {
  ...base,
  list: (filters: ReusableBlockFilters) => [...base.lists(), filters] as const,
  usages: (id: string) => ['reusable-blocks', 'usages', id] as const,
};
