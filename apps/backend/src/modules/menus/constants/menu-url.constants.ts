/**
 * Public Website URL scheme for internal menu targets (Backend Milestone
 * 11.4) — the one place these path shapes are defined, per the task's own
 * explicit examples (PAGE -> `/about`, ARTICLE -> `/blog/{slug}`,
 * CATEGORY -> `/category/{slug}`). Not invented independently — this
 * milestone's brief is the sanctioning source for a URL scheme that
 * otherwise doesn't exist anywhere yet in this codebase (no Public
 * Website has been built). If the real Public Website later needs a
 * different shape, this is the only file that needs to change.
 */
export function resolvePageUrl(slug: string): string {
  return `/${slug}`;
}

export function resolveArticleUrl(slug: string): string {
  return `/blog/${slug}`;
}

export function resolveCategoryUrl(slug: string): string {
  return `/category/${slug}`;
}
