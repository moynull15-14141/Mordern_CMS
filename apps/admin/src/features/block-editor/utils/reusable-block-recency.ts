const STORAGE_KEY = 'block-editor:recent-reusable-blocks';
const MAX_ENTRIES = 10;

/** Per-browser "recently used" list for the reusable-block picker — a
 * convenience, not a source of truth (never user/site-scoped, so it's an
 * accepted minor limitation on a shared-browser admin machine). SSR-safe
 * no-op when `window`/`localStorage` aren't available; any parse/storage
 * error degrades to an empty list rather than throwing. */
export function recordRecentlyUsedReusableBlock(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentlyUsedReusableBlockIds();
    const next = [id, ...existing.filter((existingId) => existingId !== id)].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable/full/blocked — recency is a convenience, never worth throwing over.
  }
}

export function getRecentlyUsedReusableBlockIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}
