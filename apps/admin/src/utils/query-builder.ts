/** Builds a URLSearchParams-safe query object for the Axios API layer —
 * docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "API Layer" (Pagination/
 * Filtering/Sorting). Drops undefined/null/empty-string values so a
 * feature's filter object never sends `?status=&search=` noise the
 * backend's `whitelist: true` ValidationPipe would otherwise still accept
 * but that pollutes the URL/cache-key unnecessarily. */
export function buildQueryParams(
  params: Record<string, unknown>
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      result[key] = value.join(',');
      continue;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = value;
    }
  }

  return result;
}
