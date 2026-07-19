'use client';

import { useEffect } from 'react';
import { PublicError } from '@/features/public/components/public-error';

/**
 * Next.js's special `error.tsx` — must be a Client Component (Next's own
 * requirement for error boundaries). Catches any error thrown by a route
 * segment below it (e.g. a non-404 `PublicApiError` from
 * `resolveContent`/`loadHomeContent`/`loadBlogListContent` — a genuine
 * failure, not "content missing," which `notFound()` already handles
 * separately).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console -- surfaced for local/server log visibility; no analytics wired yet.
    console.error(error);
  }, [error]);

  return (
    <PublicError
      message="We couldn't load this page. Please try again."
      detail={error.digest ? `Reference: ${error.digest}` : undefined}
      onRetry={reset}
    />
  );
}
