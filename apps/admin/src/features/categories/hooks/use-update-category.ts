'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { categoriesApi } from '../services/categories.api';
import type { UpdateCategoryInput } from '../types/category';
import { categoriesKeys } from './query-keys';

/** `PATCH /categories/:id` — never sends `parentId` (parent changes go
 * through `useMoveCategory` instead). Pessimistic: no optimistic cache
 * write. */
export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => categoriesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.flat() });
      toast.success('Category updated.');
    },
  });
}
