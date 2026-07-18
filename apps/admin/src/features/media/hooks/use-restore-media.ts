'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { mediaApi } from '../services/media.api';
import { mediaKeys } from './query-keys';

/** `POST /media/:id/restore` — reuses `media.delete` (no `media.restore`
 * permission exists). */
export function useRestoreMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mediaApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success('Media restored.');
    },
  });
}
