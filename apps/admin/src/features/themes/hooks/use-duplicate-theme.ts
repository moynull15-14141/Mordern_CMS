'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { themesApi } from '../services/themes.api';
import { themesKeys } from './query-keys';
import type { Theme } from '../types/theme';

/** No `POST /themes/:id/duplicate` endpoint exists (unlike Patterns) —
 * composed client-side from the already-fetched `Theme`, same
 * "no separate backend endpoint" precedent `reusableBlocksApi.duplicate`
 * already establishes. Never copies `status`/`isActive` — every
 * duplicate starts DRAFT and inactive, like any other newly created
 * theme. */
export function useDuplicateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (source: Theme) =>
      themesApi.create({
        name: `${source.name} (Copy)`,
        version: source.version ?? undefined,
        author: source.author ?? undefined,
        description: source.description ?? undefined,
        thumbnail: source.thumbnail ?? undefined,
        settings: source.settings ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themesKeys.lists() });
      toast.success('Theme duplicated.');
    },
    onError: () => toast.error('Could not duplicate this theme.'),
  });
}
