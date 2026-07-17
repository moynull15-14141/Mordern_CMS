import { toast } from '@/lib/toast';
import { ApiError, isApiError } from '@/lib/api-error';

/**
 * Axios Error Parser + Toast Error Handler — docs/55_FRONTEND_HANDOFF.md
 * "Error Handling". Feature mutation hooks (not yet built — foundation
 * only) call this from their `onError`; it never runs automatically for
 * every failed query (a query's own ErrorState component handles that
 * case in-place instead — see components/feedback/error-state.tsx).
 */
export function handleMutationError(error: unknown): void {
  const apiError = toApiErrorSafe(error);

  if (apiError.isUnauthorized) {
    // Session-expiry handling is owned by the Axios refresh-queue +
    // AuthProvider's onSessionExpired listener (lib/api-client.ts) — this
    // handler deliberately does not duplicate that redirect logic here.
    return;
  }

  toast.error(apiError.message);
}

function toApiErrorSafe(error: unknown): ApiError {
  if (isApiError(error)) return error;
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
  return new ApiError({ message, code: 'UNKNOWN_ERROR' });
}
