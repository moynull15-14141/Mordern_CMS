/** Own namespace, distinct from `features/users`' `usersKeys` — `GET
 * /users/me` and `GET /users/:id` are different requests even though they
 * can return the same resource, and this feature's mutations should only
 * ever invalidate its own cache. */
export const profileKeys = {
  me: () => ['profile', 'me'] as const,
};
