'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { menusApi } from '../services/menus.api';
import { menusKeys } from './query-keys';
import type {
  CreateMenuItemInput,
  ReorderMenuItemsInput,
  UpdateMenuItemInput,
} from '../types/menu';

export function useCreateMenuItem(menuId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMenuItemInput) => menusApi.createItem(menuId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menusKeys.detail(menuId) });
      toast.success('Item added.');
    },
    onError: () => toast.error('Could not add this navigation item.'),
  });
}

export function useUpdateMenuItem(menuId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateMenuItemInput }) =>
      menusApi.updateItem(menuId, itemId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menusKeys.detail(menuId) });
      toast.success('Item updated.');
    },
    onError: () => toast.error('Could not update this navigation item.'),
  });
}

export function useDeleteMenuItem(menuId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => menusApi.removeItem(menuId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menusKeys.detail(menuId) });
      toast.success('Item removed.');
    },
    onError: () =>
      toast.error(
        'Could not remove this item.',
        'Items with nested children must be un-nested or removed first.'
      ),
  });
}

/** Carries every structural change (reorder within a level, nest, or
 * un-nest) as one normalized `{id, parentId, sortOrder}[]` list, matching
 * `ReorderMenuItemsDto` exactly — the same endpoint the backend already
 * validates cycles/ownership against before writing anything. No separate
 * "save" step for structure; this fires immediately after each drag/move
 * action, same as the item edit dialog fires immediately on submit. */
export function useReorderMenuItems(menuId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderMenuItemsInput) => menusApi.reorderItems(menuId, input),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: menusKeys.detail(menuId) });
    },
    onSuccess: (menu) => {
      queryClient.setQueryData(menusKeys.detail(menuId), menu);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: menusKeys.detail(menuId) });
      toast.error('Could not save that change — the structure has been reloaded.');
    },
  });
}
