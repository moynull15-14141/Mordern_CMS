'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { mediaApi } from '../services/media.api';
import { mediaKeys } from './query-keys';

/** `DELETE /media/:id` — soft delete, rejected by the backend if the asset
 * is still referenced anywhere. */
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success('Media deleted.');
    },
  });
}
