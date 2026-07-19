'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { layoutsApi } from '../services/layouts.api';
import { layoutsKeys } from './query-keys';

/** `DELETE /layouts/:id` — soft delete, `layout.manage`-gated. */
export function useDeleteLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => layoutsApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: layoutsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: layoutsKeys.lists() });
      toast.success('Layout deleted.');
    },
  });
}
