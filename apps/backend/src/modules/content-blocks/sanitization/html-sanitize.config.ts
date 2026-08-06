import { IOptions as SanitizeHtmlOptions } from 'sanitize-html';

/**
 * Allow-list HTML sanitization config for the `html-block` block type
 * (Rich Content Engine, Phase 1 / Step 1). Deliberately an allow-list
 * (`allowedTags`/`allowedAttributes`), not a deny-list/blocklist — anything
 * not explicitly named here is stripped, which is the only sound approach
 * for user-authored HTML (a blocklist can never enumerate every dangerous
 * tag/attribute/protocol; an allow-list only has to enumerate the safe
 * ones). Deliberately hand-rolled around the `sanitize-html` package (a
 * real HTML parser, not regex) rather than `apps/backend/src/modules/comments/utils/sanitize-body.util.ts`'s
 * `stripHtmlTags` — that util is correct for `Comment.body` (a plain-text
 * column with no rich-HTML concept at all) but wrong here, where the whole
 * point of `html-block` is to allow *some* real markup through.
 *
 * `sanitize-html` is pinned to the exact version `2.17.0` (not `^2`) in
 * `apps/backend/package.json` — every `sanitize-html@2.17.1+` pulls in an
 * ESM-only `htmlparser2` (`"type": "module"`) that this project's
 * ts-jest/CommonJS test setup cannot load ("Cannot use import statement
 * outside a module"). `2.17.0` is the last release on the CJS-safe
 * `htmlparser2@^8` line. Revisit this pin if/when the backend moves to an
 * ESM-native Jest config.
 */
export const HTML_BLOCK_SANITIZE_OPTIONS: SanitizeHtmlOptions = {
  allowedTags: [
    'p',
    'br',
    'hr',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'span',
    'div',
    'a',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'code',
    'pre',
    'img',
    'figure',
    'figcaption',
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
    'caption',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    '*': ['class', 'id'],
  },
  // Only http(s)/mailto/tel — no `javascript:`/`data:` (the classic
  // `<a href="javascript:...">` / `<img src="data:...">` XSS vectors).
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  // No inline `style` / `on*` handlers — those are never in
  // `allowedAttributes`, so `sanitize-html` strips them by default, but
  // this is stated explicitly for anyone reading this config as the
  // single source of truth for what's allowed.
  disallowedTagsMode: 'discard',
  // Prevents reverse-tabnabbing on any `target="_blank"` link that slips
  // through — `sanitize-html` adds `rel="noopener noreferrer"`
  // automatically once `transformTags` below normalizes the target.
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') {
        return {
          tagName,
          attribs: { ...attribs, rel: 'noopener noreferrer' },
        };
      }
      return { tagName, attribs };
    },
  },
};
