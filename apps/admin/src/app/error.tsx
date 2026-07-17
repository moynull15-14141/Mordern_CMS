'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** 500 — Next.js special file, a segment-level error boundary (catches
 * errors React's own render-time boundary — providers/error-boundary.tsx
 * — would also catch, but Next.js requires this file specifically for
 * App Router route segments). docs item 16 "Error Handling: 500". */
export default function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="size-12 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. You can try again.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
