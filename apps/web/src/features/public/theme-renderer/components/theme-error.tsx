import { ThemeTitle } from './theme-title';

/** Themed error display — design-system equivalent of
 * `features/public/components/public-error.tsx` (13.1/13.3, left
 * unchanged and still used by `app/error.tsx`). */
export function ThemeError({
  message,
  detail,
  onRetry,
}: {
  message: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 px-4 py-24 text-center">
      <ThemeTitle level={1}>Something went wrong</ThemeTitle>
      <p className="max-w-md text-[var(--sportingspy-color-muted)]">{message}</p>
      {detail ? (
        <p className="max-w-md text-xs text-[var(--sportingspy-color-muted)]">{detail}</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-[var(--sportingspy-radius,0.5rem)] bg-[var(--sportingspy-color-primary)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
