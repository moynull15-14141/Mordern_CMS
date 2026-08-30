/** Defensive client-side scheme check — mirrors the backend's real
 * validation (`redirect-path.util.ts`'s `UNSAFE_SCHEME`) and the
 * Navigation feature's identical `isUnsafeUrlScheme` (duplicated, not
 * cross-imported — every feature stays self-contained, the established
 * `features/*` convention). This is UX (fail fast, explain why); the
 * backend remains the final authority. */
const UNSAFE_SCHEME = /^\s*(javascript|data|vbscript|file):/i;

export function isUnsafeUrlScheme(value: string): boolean {
  return UNSAFE_SCHEME.test(value);
}
