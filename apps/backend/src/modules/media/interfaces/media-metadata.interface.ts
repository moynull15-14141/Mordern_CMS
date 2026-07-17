/**
 * Stored inside the existing `MediaAsset.metadata: Json?` column — the
 * frozen schema has no `folderId` or display-`filename` column of its own
 * (see docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Known Gaps"). Mirrors the
 * `User.metadata`/`Setting.value` JSON-column-reuse pattern from Milestones
 * 6/7. `storageKey` remains the immutable real storage locator — `filename`
 * here is a logical display name only, decoupled from it.
 */
export interface MediaAssetMetadata {
  folderId?: string | null;
  filename?: string;
  [key: string]: unknown;
}
