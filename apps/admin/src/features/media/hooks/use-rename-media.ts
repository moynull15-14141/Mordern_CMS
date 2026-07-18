'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { mediaApi } from '../services/media.api';
import type { RenameMediaAssetInput } from '../types/media';
import { mediaKeys } from './query-keys';

/** `POST /media/:id/rename` — logical display name only; `storageKey` is
 * never changed. */
export function useRenameMedia(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RenameMediaAssetInput) => mediaApi.rename(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success('Media renamed.');
    },
  });
}
