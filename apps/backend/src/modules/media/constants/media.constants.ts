/**
 * Media Library Foundation (Milestone 10). `MediaType`/`MediaStatus` are the
 * frozen Prisma enums (`36_DATABASE_FREEZE.md`) — used directly, never
 * re-declared here.
 */
export enum MediaSortField {
  FILENAME = 'filename',
  MIME_TYPE = 'mimeType',
  FILESIZE = 'filesize',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum MediaFolderSortField {
  NAME = 'name',
  SLUG = 'slug',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const SLUG_MIN_LENGTH = 2;
export const SLUG_MAX_LENGTH = 200;
export const SLUG_MAX_UNIQUENESS_ATTEMPTS = 50;

/** Expected mimeType prefix per declared MediaType — cross-field
 * consistency check, not a real content-sniffing validation (no file
 * bytes are ever inspected — see docs/48_MEDIA_LIBRARY_ARCHITECTURE.md
 * "Validation"). DOCUMENT has no fixed prefix (covers application/*, text/*,
 * etc.) so it is intentionally excluded from this map. */
export const MEDIA_TYPE_MIME_PREFIX: Partial<Record<string, string>> = {
  IMAGE: 'image/',
  VIDEO: 'video/',
  AUDIO: 'audio/',
};
