import Link from 'next/link';
import type { PaginationMeta } from '../../types/api-envelope.types';

function buildHref(
  basePath: string,
  page: number,
  extraParams: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraParams)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Themed pagination — design-system equivalent of
 * `features/public/components/pagination.tsx` (13.3, left unchanged and
 * still used by `blog-list-renderer.tsx`). Plain `<Link>`s, no client
 * state, works with JavaScript disabled. */
export function ThemePagination({
  basePath,
  pagination,
  extraParams = {},
}: {
  basePath: string;
  pagination: PaginationMeta;
  extraParams?: Record<string, string | undefined>;
}) {
  if (pagination.total <= pagination.limit) return null;

  const linkStyle =
    'rounded-[var(--sportingspy-radius,0.5rem)] border border-[var(--sportingspy-color-border)] px-4 py-2 text-sm font-medium text-[var(--sportingspy-color-text)] hover:border-[var(--sportingspy-color-primary)]';
  const disabledStyle = 'px-4 py-2 text-sm text-[var(--sportingspy-color-muted)] opacity-50';

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 pt-8">
      {pagination.hasPrevious ? (
        <Link href={buildHref(basePath, pagination.page - 1, extraParams)} className={linkStyle}>
          ← Previous
        </Link>
      ) : (
        <span aria-hidden className={disabledStyle}>
          ← Previous
        </span>
      )}

      <span className="text-sm text-[var(--sportingspy-color-muted)]">
        Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.limit))}
      </span>

      {pagination.hasNext ? (
        <Link href={buildHref(basePath, pagination.page + 1, extraParams)} className={linkStyle}>
          Next →
        </Link>
      ) : (
        <span aria-hidden className={disabledStyle}>
          Next →
        </span>
      )}
    </nav>
  );
}
