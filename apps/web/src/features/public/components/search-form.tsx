/**
 * Blog search — a native `method="get"` form, no client JS: submitting it
 * is a normal browser navigation to `/blog?search=...`, which
 * `app/blog/page.tsx` reads via `searchParams` (milestone brief: "Search
 * params"). No client component needed.
 */
export function SearchForm({ action, defaultValue }: { action: string; defaultValue?: string }) {
  return (
    <form action={action} method="get" role="search" className="flex gap-2">
      <label htmlFor="blog-search" className="sr-only">
        Search articles
      </label>
      <input
        id="blog-search"
        type="search"
        name="search"
        placeholder="Search articles…"
        defaultValue={defaultValue}
        className="w-full max-w-sm rounded-[var(--sportingspy-border-radius)] border border-gray-300 px-4 py-2 text-sm focus-visible:border-[var(--sportingspy-color-primary)]"
      />
      <button
        type="submit"
        className="rounded-[var(--sportingspy-border-radius)] bg-[var(--sportingspy-color-primary)] px-4 py-2 text-sm font-medium text-white"
      >
        Search
      </button>
    </form>
  );
}
