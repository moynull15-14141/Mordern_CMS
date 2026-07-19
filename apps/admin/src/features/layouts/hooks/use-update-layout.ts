'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { layoutsApi } from '../services/layouts.api';
import type { UpdateLayoutInput } from '../types/layout';
import { layoutsKeys } from './query-keys';

/** `PATCH /layouts/:id` — `layout.manage`-gated. Pessimistic (mirrors
 * `useUpdateTheme`): no optimistic cache write. */
export function useUpdateLayout(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateLayoutInput) => layoutsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: layoutsKeys.lists() });
      toast.success('Layout updated.');
    },
  });
}
