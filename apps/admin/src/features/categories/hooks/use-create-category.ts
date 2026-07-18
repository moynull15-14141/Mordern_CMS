'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { categoriesApi } from '../services/categories.api';
import type { CreateCategoryInput } from '../types/category';
import { categoriesKeys } from './query-keys';

/** `POST /categories` — `category.create`-gated. */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.tree() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.flat() });
      toast.success('Category created.');
    },
  });
}
