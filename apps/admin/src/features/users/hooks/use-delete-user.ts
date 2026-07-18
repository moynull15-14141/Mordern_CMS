'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { usersApi } from '../services/users.api';
import { usersKeys } from './query-keys';

/** `DELETE /users/:id` — soft delete (`deletedAt`/`deletedBy`); the row
 * remains restorable via `useRestoreUser`. */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('User deleted.');
    },
  });
}
