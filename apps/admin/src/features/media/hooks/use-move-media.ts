'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { mediaApi } from '../services/media.api';
import type { MoveMediaAssetInput } from '../types/media';
import { mediaKeys } from './query-keys';

/** `POST /media/:id/move` — moves to a folder (`metadata.folderId` — no
 * real FK column exists on `MediaAsset`). */
export function useMoveMedia(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MoveMediaAssetInput) => mediaApi.move(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success('Media moved.');
    },
  });
}
