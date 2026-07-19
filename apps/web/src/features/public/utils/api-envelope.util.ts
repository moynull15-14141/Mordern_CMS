import type { ApiEnvelope } from '../types/api-envelope.types';
import { PublicApiError } from './errors';

/** Unwraps the backend's response envelope (docs/53_API_FREEZE.md), the
 * same "one shared unwrap function" pattern
 * `apps/admin/src/lib/api-client.ts`'s `unwrapEnvelope` establishes —
 * adapted here for a plain `fetch`-based, server-only call site instead of
 * an Axios interceptor. */
export function unwrapEnvelope<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success) {
    const firstError = envelope.errors[0];
    throw new PublicApiError({
      message: firstError?.message ?? envelope.message,
      code: firstError?.code ?? 'UNKNOWN_ERROR',
      status: undefined,
    });
  }
  return envelope.data;
}
