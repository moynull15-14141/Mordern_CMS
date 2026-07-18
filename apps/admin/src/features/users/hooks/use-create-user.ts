'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { usersApi } from '../services/users.api';
import type { CreateUserInput } from '../types/user';
import { usersKeys } from './query-keys';

/** `POST /users` — no `status`/`role` field; created users are always
 * `PENDING` (docs/63_FRONTEND_USERS.md). */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('User created.');
    },
  });
}
