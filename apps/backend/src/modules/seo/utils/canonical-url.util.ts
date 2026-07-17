/**
 * Canonical URL normalization — pure functions, no I/O. Applied before
 * every persisted write (`SeoValidator.assertCanonicalUrl`) so a
 * cosmetically-different but semantically-identical URL never collides
 * with itself across requests.
 *
 * Trailing slash strategy: canonical URLs conventionally omit a trailing
 * slash (the widely-used convention this module follows), EXCEPT for the
 * bare root path (`/`), which must keep its single slash — stripping it
 * would leave an empty path, not a valid URL.
 */

const SCHEME_PATTERN = /^([a-zA-Z][a-zA-Z\d+\-.]*):\/\/(.*)$/;

interface SplitUrl {
  prefix: string; // "scheme://host"
  path: string; // "" | "/" | "/segment/segment..."
}

function split(url: string): SplitUrl | null {
  const match = SCHEME_PATTERN.exec(url);
  if (!match) return null;
  const [, scheme, rest] = match as unknown as [string, string, string];
  const slashIndex = rest.indexOf('/');
  if (slashIndex === -1) {
    return { prefix: `${scheme}://${rest}`, path: '' };
  }
  return { prefix: `${scheme}://${rest.slice(0, slashIndex)}`, path: rest.slice(slashIndex) };
}

/** Collapses runs of consecutive slashes in the PATH portion only (never
 * touching the `://` after the scheme). Non-URL-shaped input (no
 * `scheme://`) falls back to a plain global collapse. */
export function removeDuplicateSlashes(url: string): string {
  const parts = split(url);
  if (!parts) {
    return url.replace(/\/{2,}/g, '/');
  }
  const collapsedPath = parts.path.replace(/\/{2,}/g, '/');
  return `${parts.prefix}${collapsedPath}`;
}

/** Removes a trailing slash unless the path is exactly the root (`/`) or
 * there is no path at all. */
export function applyTrailingSlashStrategy(url: string): string {
  const parts = split(url);
  if (!parts) {
    return url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
  }
  if (parts.path === '' || parts.path === '/') {
    return `${parts.prefix}${parts.path}`;
  }
  const trimmedPath = parts.path.endsWith('/') ? parts.path.slice(0, -1) : parts.path;
  return `${parts.prefix}${trimmedPath}`;
}

/** Full normalization pipeline: trim -> collapse duplicate slashes -> apply
 * trailing slash strategy. Does NOT validate the result is a well-formed
 * URL — see `SeoValidator.assertCanonicalUrl` for that. */
export function normalizeCanonicalUrl(url: string): string {
  const trimmed = url.trim();
  const deduped = removeDuplicateSlashes(trimmed);
  return applyTrailingSlashStrategy(deduped);
}
