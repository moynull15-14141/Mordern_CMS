export enum RedirectSortField {
  SOURCE_PATH = 'sourcePath',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

/** `Redirect.redirectType` is a plain `Int` on the schema (no enum) —
 * these are the only two values ever written; enforced at the DTO/service
 * layer, not the database. */
export const ALLOWED_REDIRECT_TYPES = [301, 302] as const;
export const DEFAULT_REDIRECT_TYPE = 301;

/** Bounds the chain walk `RedirectsService.assertNoLoop` performs — a
 * legitimate redirect chain longer than this almost certainly indicates a
 * misconfiguration, not a real use case worth supporting. */
export const MAX_REDIRECT_CHAIN_LENGTH = 10;
