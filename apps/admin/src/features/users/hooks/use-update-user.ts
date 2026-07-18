'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { usersApi } from '../services/users.api';
import type { UpdateUserInput } from '../types/user';
import { usersKeys } from './query-keys';

/** `PATCH /users/:id` — identity fields only (`username`/`displayName`).
 * Pessimistic (approved decision 5): the mutation waits for the server
 * response before the UI reflects any change — no optimistic cache write. */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUserInput) => usersApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('User updated.');
    },
  });
}
