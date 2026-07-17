/**
 * Comments & Discussion Foundation (Milestone 11). Mirrors the constants
 * pattern established by Articles/Categories/Media — closed vocabulary in
 * code, data in the database. See docs/49_COMMENTS_ARCHITECTURE.md.
 */
export enum CommentSortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  VOTES = 'votes',
}

/** Non-empty after sanitization (see `utils/sanitize-body.util.ts`). */
export const COMMENT_BODY_MIN_LENGTH = 1;
export const COMMENT_BODY_MAX_LENGTH = 5000;

/** `Comment.moderationReason` — free text, bounded. */
export const COMMENT_MODERATION_REASON_MAX_LENGTH = 1000;
