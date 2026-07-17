/**
 * Foundation only (Milestone 11) — pure interface, zero implementation,
 * zero DI binding, mirroring the `EmailProvider`/`StorageProvider` pattern
 * established in `37_IDENTITY_FREEZE.md`/`48_MEDIA_LIBRARY_ARCHITECTURE.md`.
 * A future implementation would scan `Comment.body` for `@username`-style
 * tokens and resolve them against `User`/`Author` for a Notifications
 * integration. Nothing in this module calls or registers one.
 */
export interface MentionParser {
  parseMentions(body: string): string[];
}
