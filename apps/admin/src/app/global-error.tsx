'use client';

/** Root-level fatal fallback — Next.js special file, catches errors in the
 * root layout itself (where the regular error.tsx boundary can't reach,
 * since it renders inside that same layout). Must render its own
 * <html>/<body> since the root layout has failed. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            A critical error occurred. Please reload the page.
          </p>
          <button
            onClick={reset}
            style={{
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
