'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../services/users.api';
import { usersKeys } from './query-keys';

/** `GET /users/:id` — `users.manage`-gated server-side. */
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: usersKeys.detail(id ?? ''),
    queryFn: () => usersApi.get(id as string),
    enabled: Boolean(id),
  });
}
