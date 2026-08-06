'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { isApiError } from '@/lib/api-error';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import { reusableBlocksKeys } from './query-keys';

/** `DELETE /content-blocks/reusable/:id` — soft delete, `page.manage`-
 * gated. Unlike Themes' delete hook, this one toasts on error too: the
 * backend routinely rejects this call (409, still referenced by a Page/
 * Article) and `ConfirmDialog` calls `onConfirm` without awaiting a
 * resolved/rejected distinction, so a silent failure here would look like
 * a no-op click to the user. */
export function useDeleteReusableBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reusableBlocksApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: reusableBlocksKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reusableBlocksKeys.lists() });
      toast.success('Reusable block deleted.');
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Could not delete this reusable block.');
    },
  });
}
