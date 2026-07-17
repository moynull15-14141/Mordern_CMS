/**
 * `Comment.body` has no rich-text/HTML flag anywhere in the frozen schema
 * (it's a plain `String`), so this module treats comments as plain text —
 * the "HTML sanitization hook" the milestone brief calls for is satisfied
 * by stripping ALL markup rather than attempting to allow-list a rich-text
 * subset (which would need a real HTML parser this codebase doesn't
 * depend on). Deliberately simple: strips tags and decodes nothing, so no
 * entity-decoding double-unescape XSS vector is introduced.
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Trims and collapses the sanitized body — used to detect "empty after
 * sanitization" (e.g. a comment that was only a `<script>` tag). */
export function sanitizeCommentBody(input: string): string {
  return stripHtmlTags(input).trim();
}
