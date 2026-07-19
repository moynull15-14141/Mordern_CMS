'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { layoutsApi } from '../services/layouts.api';
import { layoutsKeys } from './query-keys';

/** `POST /layouts/:id/restore` — `layout.manage`-gated. */
export function useRestoreLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => layoutsApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: layoutsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: layoutsKeys.lists() });
      toast.success('Layout restored.');
    },
  });
}
