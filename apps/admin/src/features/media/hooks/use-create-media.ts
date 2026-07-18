'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '../services/media.api';
import type { CreateMediaAssetInput } from '../types/media';
import { mediaKeys } from './query-keys';

/** `POST /media` — registers metadata only (no file bytes transferred).
 * No toast here — the Upload queue UI shows per-item success/error state
 * itself (see `UploadQueueItem`), and a single blanket toast per file
 * would be noisy for a multi-file queue. */
export function useCreateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, signal }: { input: CreateMediaAssetInput; signal?: AbortSignal }) =>
      mediaApi.create(input, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
}
