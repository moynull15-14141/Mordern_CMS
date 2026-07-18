'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { categoriesApi } from '../services/categories.api';
import type { MoveCategoryInput } from '../types/category';
import { categoriesKeys } from './query-keys';

/** `POST /categories/:id/move` — circular-reference safe on the backend.
 * Broadly invalidates every category query (`categoriesKeys.all`) since a
 * move changes ancestor/descendant/children-count relationships for
 * potentially many nodes at once, not just the moved one. */
export function useMoveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MoveCategoryInput }) => categoriesApi.move(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      toast.success('Category moved.');
    },
  });
}
