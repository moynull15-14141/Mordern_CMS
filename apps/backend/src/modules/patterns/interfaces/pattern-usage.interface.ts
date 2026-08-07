/**
 * A detected "inserted from" reference — insertion is always a detached
 * copy (fresh ids, no live link), so this reports where a pattern's block
 * tree was *once inserted from*, not a live/currently-linked reference.
 * Detected via `meta.patternOrigin.patternId`, stamped client-side at
 * insert time — if a user heavily edits/removes the inherited blocks, the
 * marker naturally disappears with them (an honest signal, not tracked
 * separately).
 */
export interface PatternUsageReference {
  contentType: 'page' | 'article' | 'reusable-block';
  id: string;
  title: string;
  slug?: string;
}
