const STORAGE_KEY = 'patterns:recently-used';
const MAX_ENTRIES = 10;

/**
 * Per-browser "recently inserted" list for the Pattern Picker — mirrors
 * `block-editor/utils/reusable-block-recency.ts` exactly (same tradeoff:
 * a convenience, not a source of truth, never user/site-scoped; an
 * accepted minor limitation on a shared-browser admin machine). Chosen
 * over the DB-backed Media Favorites/Recent architecture specifically for
 * *recency* — Favorites (a more deliberate, cross-device action) reuses
 * that server-persisted pattern instead (see `use-pattern-favorites.ts`);
 * this avoids a backend write on every single pattern insertion, which
 * the milestone brief explicitly calls out as unnecessary. SSR-safe
 * no-op when `window`/`localStorage` aren't available; any parse/storage
 * error degrades to an empty list rather than throwing.
 */
export function recordRecentlyUsedPattern(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentlyUsedPatternIds();
    const next = [id, ...existing.filter((existingId) => existingId !== id)].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable/full/blocked — recency is a convenience, never worth throwing over.
  }
}

export function getRecentlyUsedPatternIds(): string[] {
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
