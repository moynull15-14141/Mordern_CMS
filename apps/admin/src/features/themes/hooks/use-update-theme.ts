'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { themesApi } from '../services/themes.api';
import type { UpdateThemeInput } from '../types/theme';
import { themesKeys } from './query-keys';

/** `PATCH /themes/:id` — `theme.manage`-gated. Pessimistic (mirrors
 * `useUpdatePage`): no optimistic cache write. */
export function useUpdateTheme(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateThemeInput) => themesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: themesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: themesKeys.active() });
      toast.success('Theme updated.');
    },
  });
}
