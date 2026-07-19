'use client';

import { useQuery } from '@tanstack/react-query';
import { layoutsApi } from '../services/layouts.api';
import { layoutsKeys } from './query-keys';

/** `GET /layouts/:id` — backs the Detail and Edit pages. */
export function useLayout(id: string) {
  return useQuery({
    queryKey: layoutsKeys.detail(id),
    queryFn: () => layoutsApi.get(id),
    enabled: Boolean(id),
  });
}
