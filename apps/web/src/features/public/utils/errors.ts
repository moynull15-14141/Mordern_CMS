/** Thrown when a real public API call fails (network error, non-2xx, or an
 * envelope with `success: false`) — mirrors `apps/admin/src/lib/api-error.ts`'s
 * shape for the same reason: one predictable error type every caller can
 * catch, instead of raw `fetch`/parsing exceptions. A 404 (`status === 404`)
 * is the expected, real shape of "no content resolves for this slug" —
 * `resolver/content-resolver.ts` catches that case specifically and turns
 * it into a `not-found` result; any other status propagates as a genuine
 * error. */
export class PublicApiError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(params: { message: string; code: string; status?: number }) {
    super(params.message);
    this.name = 'PublicApiError';
    this.code = params.code;
    this.status = params.status;
  }
}
