/**
 * Renderer-side defense-in-depth for the block types whose `data` carries
 * a plain `url` string field rendered straight into an `href`/`src`
 * (`button`, `file-download`) — unlike `html-block`, these fields are
 * validated for *presence* (`BlockTreeValidator`) but not run through the
 * allow-list HTML sanitizer (they were never markup to begin with, just a
 * URL). A `javascript:`/`data:` URL in one of these fields would execute
 * on click if rendered unchecked. Same allowed-scheme list as the
 * backend's `HTML_BLOCK_SANITIZE_OPTIONS.allowedSchemes`
 * (`apps/backend/src/modules/content-blocks/sanitization/html-sanitize.config.ts`) —
 * kept in sync by hand, matching this module's established
 * parallel-but-separate-per-app convention.
 */
const SAFE_URL_PATTERN = /^(https?:|mailto:|tel:|\/|#)/i;

export function isSafeHref(url: string): boolean {
  return SAFE_URL_PATTERN.test(url.trim());
}
