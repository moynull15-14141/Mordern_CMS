'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reusableBlocksApi } from '../api/reusable-blocks.api';
import type { CreateReusableBlockFromEditorInput } from '../api/reusable-block.types';

/** `POST /content-blocks/reusable` from inside the editor's "Save as
 * reusable" / "Convert to reusable" flow (`components/property-panel/`).
 * Invalidates this feature's own picker query so the just-saved block
 * shows up immediately without a refetch delay — does not toast itself
 * (the calling dialog owns success/error messaging, since it also needs
 * the created block's id to update the tree). */
export function useCreateReusableBlockFromEditor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReusableBlockFromEditorInput) => reusableBlocksApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['block-editor', 'reusable-blocks'] });
    },
  });
}
