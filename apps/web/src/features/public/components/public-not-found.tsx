import Link from 'next/link';

/** Shared 404 presentational component — rendered by `NotFoundRenderer`
 * (a real, resolved "not-found" content result) and by Next's special
 * `app/not-found.tsx` file (an unmatched URL, no `path` available). */
export function PublicNotFound({ path }: { path: string }) {
  return (
    <div
      data-testid="public-not-found"
      role="status"
      className="container-page flex flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--sportingspy-color-primary)]">
        404
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Page not found</h1>
      <p className="max-w-md text-gray-600">
        {path ? <>Nothing is published at &quot;{path}&quot;.</> : 'This page doesn’t exist.'}
      </p>
      <Link
        href="/"
        className="mt-2 rounded-[var(--sportingspy-border-radius)] bg-[var(--sportingspy-color-primary)] px-5 py-2.5 text-sm font-medium text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
