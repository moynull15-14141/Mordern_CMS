/**
 * Slug normalization — shared by both auto-generation (from title) and
 * manual override (still normalized, never trusted verbatim). See
 * docs/46_ARTICLES_ARCHITECTURE.md "Slug Strategy". Reused as-is by the
 * Categories & Tags module (Milestone 9) rather than duplicating the shape
 * rule — see docs/47_CATEGORY_TAG_ARCHITECTURE.md "Slug Strategy".
 */
export const SLUG_SHAPE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (combining marks left by NFKD)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function generateSlugFromTitle(title: string): string {
  return normalizeSlug(title);
}

/** Appends `-2`, `-3`, ... to an auto-generated slug until `isTaken` returns
 * false. Only used for auto-generated slugs — a manually-provided slug that
 * collides is rejected instead (see ArticlesService.createArticle). */
export async function uniquifySlug(
  baseSlug: string,
  isTaken: (candidate: string) => Promise<boolean>,
  maxAttempts: number
): Promise<string> {
  let candidate = baseSlug;
  let attempt = 1;
  while (await isTaken(candidate)) {
    attempt += 1;
    if (attempt > maxAttempts) {
      throw new Error(
        `Could not generate a unique slug for "${baseSlug}" after ${maxAttempts} attempts.`
      );
    }
    candidate = `${baseSlug}-${attempt}`;
  }
  return candidate;
}
