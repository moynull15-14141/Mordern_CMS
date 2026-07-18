'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../services/users.api';
import type { UserFilters } from '../types/user';
import { usersKeys } from './query-keys';

/** `GET /users` — paginated/filtered/sorted/searched list, `users.manage`-gated
 * server-side. Server-driven only; never re-sorts/re-filters client-side. */
export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersApi.list(filters),
  });
}
