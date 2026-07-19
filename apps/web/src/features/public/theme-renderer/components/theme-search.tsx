/** Themed search form — design-system equivalent of
 * `features/public/components/search-form.tsx` (13.3, left unchanged and
 * still used by `blog-list-renderer.tsx`). A native `method="get"` form —
 * no client JS, works with JavaScript disabled. */
export function ThemeSearch({ action, defaultValue }: { action: string; defaultValue?: string }) {
  return (
    <form action={action} method="get" role="search" className="flex gap-2">
      <label htmlFor="theme-search" className="sr-only">
        Search
      </label>
      <input
        id="theme-search"
        type="search"
        name="search"
        placeholder="Search…"
        defaultValue={defaultValue}
        className="w-full max-w-sm rounded-[var(--sportingspy-radius,0.5rem)] border border-[var(--sportingspy-color-border)] px-4 py-2 text-sm text-[var(--sportingspy-color-text)] focus-visible:border-[var(--sportingspy-color-primary)]"
      />
      <button
        type="submit"
        className="rounded-[var(--sportingspy-radius,0.5rem)] bg-[var(--sportingspy-color-primary)] px-4 py-2 text-sm font-medium text-white"
      >
        Search
      </button>
    </form>
  );
}
