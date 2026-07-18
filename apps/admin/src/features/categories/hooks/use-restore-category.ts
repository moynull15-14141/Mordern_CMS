'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { categoriesApi } from '../services/categories.api';
import { categoriesKeys } from './query-keys';

/** `POST /categories/:id/restore` — reuses `category.create` (no
 * `category.restore` permission exists). */
export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      toast.success('Category restored.');
    },
  });
}
