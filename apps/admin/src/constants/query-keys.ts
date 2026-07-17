/**
 * Shared query-key factory conventions — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "lib/query-keys.ts": the FACTORY PATTERN is defined once here; per-feature
 * keys live in each feature's own hooks (not yet built — foundation only).
 * Two keys ARE defined here since they're consumed by shared infrastructure
 * (the Auth/Permission providers), not a business feature.
 */
export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  authorization: {
    me: () => ['authorization', 'me'] as const,
  },
} as const;

/** Generic factory a future feature module composes from — e.g.
 * `resourceKeys('articles')` -> `{ all, lists, list(filters), details, detail(id) }`,
 * the standard TanStack Query key hierarchy. */
export function resourceKeys(resource: string) {
  return {
    all: [resource] as const,
    lists: () => [resource, 'list'] as const,
    list: (filters: unknown) => [resource, 'list', filters] as const,
    details: () => [resource, 'detail'] as const,
    detail: (id: string) => [resource, 'detail', id] as const,
  };
}
