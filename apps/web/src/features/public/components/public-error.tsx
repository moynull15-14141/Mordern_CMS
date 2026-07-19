/** Shared error presentational component — rendered by `app/error.tsx`
 * (Next's client-component error boundary; see that file's doc comment). */
export function PublicError({
  message,
  detail,
  onRetry,
}: {
  message: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      data-testid="public-error"
      role="alert"
      className="container-page flex flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8"
    >
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Something went wrong</h1>
      <p className="max-w-md text-gray-600">{message}</p>
      {detail ? (
        <p data-testid="public-error-detail" className="max-w-md text-xs text-gray-400">
          {detail}
        </p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-[var(--sportingspy-border-radius)] bg-[var(--sportingspy-color-primary)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
