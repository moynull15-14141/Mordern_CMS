import { resourceKeys } from '@/constants/query-keys';
import type { UserFilters } from '../types/user';

/**
 * Per-feature query keys built from the shared `resourceKeys()` factory
 * (`constants/query-keys.ts`, docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "lib/query-keys.ts"), extended with the two sub-resources
 * `UsersController` exposes beyond plain CRUD: the caller's own profile
 * (`me`) and a user's sessions.
 */
const base = resourceKeys('users');

export const usersKeys = {
  ...base,
  list: (filters: UserFilters) => [...base.lists(), filters] as const,
  me: () => ['users', 'me'] as const,
  sessions: (userId: string) => ['users', userId, 'sessions'] as const,
};
