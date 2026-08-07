import { resourceKeys } from '@/constants/query-keys';
import type { PatternFilters } from '../types/pattern';

const base = resourceKeys('patterns');

export const patternsKeys = {
  ...base,
  list: (filters: PatternFilters) => [...base.lists(), filters] as const,
  usages: (id: string) => ['patterns', id, 'usages'] as const,
  favorites: () => ['patterns', 'favorites'] as const,
};
