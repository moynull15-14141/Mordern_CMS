'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { redirectsApi } from '../services/redirects.api';
import { redirectsKeys } from './query-keys';
import type { CreateRedirectInput, Redirect, UpdateRedirectInput } from '../types/redirect';

/** No `onError` toast on create/update — mirrors `useCreatePage`/
 * `useCreateMenu`: the form reads `mutation.error` into an inline
 * `submitError` so the real backend message (duplicate source, loop
 * detected, invalid path) shows up next to the fields, not a generic toast. */
export function useCreateRedirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRedirectInput) => redirectsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: redirectsKeys.lists() });
      toast.success('Redirect created.');
    },
  });
}

export function useUpdateRedirect(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRedirectInput) => redirectsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: redirectsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: redirectsKeys.lists() });
      toast.success('Redirect saved.');
    },
  });
}

export function useDeleteRedirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => redirectsApi.remove(id),
    onSuccess: (_data: Redirect, id) => {
      queryClient.invalidateQueries({ queryKey: redirectsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: redirectsKeys.lists() });
      toast.success('Redirect deleted.');
    },
    onError: () => toast.error('Could not delete this redirect.'),
  });
}

export function useRestoreRedirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => redirectsApi.restore(id),
    onSuccess: (_data: Redirect, id) => {
      queryClient.invalidateQueries({ queryKey: redirectsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: redirectsKeys.lists() });
      toast.success('Redirect restored.');
    },
    onError: () => toast.error('Could not restore this redirect.'),
  });
}
