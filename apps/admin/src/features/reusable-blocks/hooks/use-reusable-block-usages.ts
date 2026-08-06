'use client';

import { useQuery } from '@tanstack/react-query';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import { reusableBlocksKeys } from './query-keys';

/** `GET /content-blocks/reusable/:id/usages` — a full Page/Article body
 * scan on the backend (no relational index), so this is fetched lazily
 * (`enabled`-gated) only where it's actually shown: the Detail page's
 * "Used By" panel, and the Delete dialog while it's open. Never fetched
 * from the list page. */
export function useReusableBlockUsages(id: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: reusableBlocksKeys.usages(id),
    queryFn: () => reusableBlocksApi.getUsages(id),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}
