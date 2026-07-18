'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { usersApi } from '../services/users.api';
import { usersKeys } from './query-keys';

/** `POST /users/:id/restore` — clears `deletedAt`/`deletedBy`. */
export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('User restored.');
    },
  });
}
