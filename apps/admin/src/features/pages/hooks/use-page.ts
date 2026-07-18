'use client';

import { useQuery } from '@tanstack/react-query';
import { pagesApi } from '../services/pages.api';
import { pagesKeys } from './query-keys';

/** `GET /pages/:id` — backs the Detail and Edit pages. */
export function usePage(id: string) {
  return useQuery({
    queryKey: pagesKeys.detail(id),
    queryFn: () => pagesApi.get(id),
    enabled: Boolean(id),
  });
}
