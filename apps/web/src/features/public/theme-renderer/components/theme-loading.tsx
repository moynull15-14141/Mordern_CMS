/** Themed loading skeleton — design-system equivalent of
 * `features/public/components/public-loading.tsx` (13.1/13.3, left
 * unchanged and still used by `app/loading.tsx`). Uses
 * `--sportingspy-color-surface` instead of a hardcoded gray so the pulse
 * blocks stay legible in dark mode too (`styles/globals.css`'s
 * `prefers-color-scheme: dark` override). */
export function ThemeLoading() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading" className="animate-pulse px-4 py-12">
      <div className="h-8 w-2/3 max-w-md rounded bg-[var(--sportingspy-color-surface)]" />
      <div className="mt-4 h-4 w-1/2 max-w-sm rounded bg-[var(--sportingspy-color-surface)]" />
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex flex-col gap-3">
            <div className="h-4 w-1/3 rounded bg-[var(--sportingspy-color-surface)]" />
            <div className="h-5 w-full rounded bg-[var(--sportingspy-color-surface)]" />
            <div className="h-4 w-5/6 rounded bg-[var(--sportingspy-color-surface)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
