'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { themesApi } from '../services/themes.api';
import { themesKeys } from './query-keys';

/** `DELETE /themes/:id` — soft delete, `theme.manage`-gated. */
export function useDeleteTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: themesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: themesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: themesKeys.active() });
      toast.success('Theme deleted.');
    },
  });
}
