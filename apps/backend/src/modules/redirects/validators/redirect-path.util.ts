const UNSAFE_SCHEME = /^\s*(javascript|data|vbscript|file):/i;

/** A redirect *source* is always an internal request path — never a full
 * URL. Normalizes to a leading `/`, strips a trailing `/` (except the
 * root path itself), and rejects `..` segments/unsafe schemes/whitespace. */
export function normalizeSourcePath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed || UNSAFE_SCHEME.test(trimmed) || trimmed.includes('..')) {
    throw new Error('invalid source path');
  }
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.slice(0, -1);
  }
  return withLeadingSlash;
}

export function isValidSourcePath(input: string): boolean {
  try {
    normalizeSourcePath(input);
    return true;
  } catch {
    return false;
  }
}

/** A redirect *destination* may be an internal path (`/new-page`) or a
 * real external URL — but never an unsafe scheme, and an external one
 * must be `http`/`https`. */
export function isValidDestination(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed || UNSAFE_SCHEME.test(trimmed)) return false;
  if (trimmed.startsWith('/')) return !trimmed.includes('..');
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** True when `destination` is itself an internal path this redirect table
 * could have a matching `sourcePath` for — i.e. worth following one more
 * hop when walking a chain for loop detection. An external URL is always
 * a chain's end. */
export function isInternalPath(destination: string): boolean {
  return destination.startsWith('/');
}
