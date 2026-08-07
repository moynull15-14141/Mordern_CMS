'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { patternsApi } from '../services/patterns.api';
import { patternsKeys } from './query-keys';
import type { CreatePatternInput, Pattern, UpdatePatternInput } from '../types/pattern';

export function useCreatePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePatternInput) => patternsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.lists() });
      toast.success('Pattern created.');
    },
  });
}

export function useUpdatePattern(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePatternInput) => patternsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patternsKeys.lists() });
      toast.success('Pattern updated.');
    },
  });
}

export function useDuplicatePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patternsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.lists() });
      toast.success('Pattern duplicated.');
    },
    onError: () => toast.error('Could not duplicate this pattern.'),
  });
}

export function useArchivePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patternsApi.archive(id),
    onSuccess: (_data: Pattern, id) => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patternsKeys.lists() });
      toast.success('Pattern archived.');
    },
  });
}

export function useUnarchivePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patternsApi.unarchive(id),
    onSuccess: (_data: Pattern, id) => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patternsKeys.lists() });
      toast.success('Pattern unarchived.');
    },
  });
}

export function useDeletePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patternsApi.remove(id),
    onSuccess: (_data: Pattern, id) => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patternsKeys.lists() });
      toast.success('Pattern deleted.');
    },
    onError: () => toast.error('Could not delete this pattern.'),
  });
}

export function useRestorePattern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patternsApi.restore(id),
    onSuccess: (_data: Pattern, id) => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patternsKeys.lists() });
      toast.success('Pattern restored.');
    },
  });
}
