import Link from 'next/link';
import type { PaginationMeta } from '../types/api-envelope.types';

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

/**
 * Reusable server-rendered pagination control — plain `<Link>`s (no
 * client-side state), so page navigation works with JavaScript disabled
 * and needs no client component. Used by `/blog` (milestone brief:
 * "server pagination... page navigation").
 */
export function Pagination({
  basePath,
  pagination,
  extraParams = {},
}: {
  basePath: string;
  pagination: PaginationMeta;
  extraParams?: Record<string, string | undefined>;
}) {
  if (pagination.total <= pagination.limit) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 pt-8">
      {pagination.hasPrevious ? (
        <Link
          href={buildHref(basePath, pagination.page - 1, extraParams)}
          className="rounded-[var(--sportingspy-border-radius)] border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
        >
          ← Previous
        </Link>
      ) : (
        <span aria-hidden className="px-4 py-2 text-sm text-gray-300">
          ← Previous
        </span>
      )}

      <span className="text-sm text-gray-500">
        Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.limit))}
      </span>

      {pagination.hasNext ? (
        <Link
          href={buildHref(basePath, pagination.page + 1, extraParams)}
          className="rounded-[var(--sportingspy-border-radius)] border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
        >
          Next →
        </Link>
      ) : (
        <span aria-hidden className="px-4 py-2 text-sm text-gray-300">
          Next →
        </span>
      )}
    </nav>
  );
}
