/** Defensive client-side scheme check for External/Custom link items —
 * the backend's `@IsUrl` validator (validator.js `isURL`, default
 * `protocols: ['http', 'https', 'ftp']`) already rejects `javascript:`/
 * `data:`/etc. server-side, so this is UX (fail fast, explain why)
 * layered on top of that real enforcement, not a replacement for it. */
const UNSAFE_SCHEME = /^\s*(javascript|data|vbscript):/i;

export function isUnsafeUrlScheme(value: string): boolean {
  return UNSAFE_SCHEME.test(value);
}
