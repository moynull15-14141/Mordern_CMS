'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { themesApi } from '../services/themes.api';
import { themesKeys } from './query-keys';

/** `POST /themes/:id/restore` — `theme.manage`-gated. */
export function useRestoreTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: themesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: themesKeys.lists() });
      toast.success('Theme restored.');
    },
  });
}
