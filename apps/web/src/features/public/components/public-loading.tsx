/** Shared loading skeleton — used as `app/loading.tsx`'s content
 * (Next.js streams this in while a route's Server Component `await`s are
 * pending; milestone brief: "Skeleton loading"). Pure CSS pulse, no JS. */
export function PublicLoading() {
  return (
    <div
      data-testid="public-loading"
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="container-page animate-pulse px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="h-8 w-2/3 max-w-md rounded bg-gray-200" />
      <div className="mt-4 h-4 w-1/2 max-w-sm rounded bg-gray-200" />
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex flex-col gap-3">
            <div className="h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-5 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
