'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { categoriesApi } from '../services/categories.api';
import { categoriesKeys } from './query-keys';

/** `DELETE /categories/:id` — soft delete, rejected by the backend if the
 * category is still used by articles or has active children. */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      toast.success('Category deleted.');
    },
  });
}
