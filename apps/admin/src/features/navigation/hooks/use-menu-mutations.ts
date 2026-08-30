'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { menusApi } from '../services/menus.api';
import { menusKeys } from './query-keys';
import type { CreateMenuInput, Menu, UpdateMenuInput } from '../types/menu';

/** No `onError` toast — mirrors `useCreatePage`: the form itself reads
 * `mutation.error`/`isApiError` into a `submitError` alert so the real
 * backend message (e.g. a location-conflict 409) is shown inline rather
 * than a generic toast. */
export function useCreateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMenuInput) => menusApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menusKeys.lists() });
      toast.success('Navigation created.');
    },
  });
}

/** No `onError` toast — see `useCreateMenu`; the Settings form surfaces
 * the real error inline instead. */
export function useUpdateMenu(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMenuInput) => menusApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: menusKeys.lists() });
      toast.success('Navigation saved.');
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menusApi.remove(id),
    onSuccess: (_data: Menu, id) => {
      queryClient.invalidateQueries({ queryKey: menusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: menusKeys.lists() });
      toast.success('Navigation deleted.');
    },
    onError: () => toast.error('Could not delete this navigation menu.'),
  });
}

/** `MenuQueryDto` has no "include deleted" filter, so a deleted menu has
 * no admin-UI path back — this hook exists because the real
 * `POST /menus/:id/restore` endpoint does, ready to wire up the moment a
 * Trash/"show deleted" view is worth adding (see the completion report's
 * Known Limitations). */
export function useRestoreMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menusApi.restore(id),
    onSuccess: (_data: Menu, id) => {
      queryClient.invalidateQueries({ queryKey: menusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: menusKeys.lists() });
      toast.success('Navigation restored.');
    },
    onError: () => toast.error('Could not restore this navigation menu.'),
  });
}
