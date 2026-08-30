'use client';

import { useQuery } from '@tanstack/react-query';
import { redirectsApi } from '../services/redirects.api';
import { redirectsKeys } from './query-keys';
import type { RedirectFilters } from '../types/redirect';

export function useRedirects(filters: RedirectFilters) {
  return useQuery({
    queryKey: redirectsKeys.list(filters),
    queryFn: () => redirectsApi.list(filters),
  });
}

export function useRedirect(id: string) {
  return useQuery({
    queryKey: redirectsKeys.detail(id),
    queryFn: () => redirectsApi.get(id),
    enabled: Boolean(id),
  });
}
