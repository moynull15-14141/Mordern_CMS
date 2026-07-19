import { env } from '@/lib/env';
import { PUBLIC_FETCH_REVALIDATE_SECONDS } from '../constants/rendering.constants';
import type { ApiEnvelope, PaginationMeta } from '../types/api-envelope.types';
import { unwrapEnvelope } from '../utils/api-envelope.util';
import { PublicApiError } from '../utils/errors';

export interface PaginatedFetchResult<T> {
  data: T;
  pagination: PaginationMeta;
}

async function fetchEnvelope<T>(path: string): Promise<ApiEnvelope<T>> {
  const url = `${env.API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: PUBLIC_FETCH_REVALIDATE_SECONDS },
    });
  } catch {
    throw new PublicApiError({
      message: 'Network error — could not reach the backend.',
      code: 'NETWORK_ERROR',
    });
  }

  let body: ApiEnvelope<T> | undefined;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // fall through — `body` stays undefined, handled below.
  }

  if (!response.ok || !body) {
    const firstError = body?.errors?.[0];
    throw new PublicApiError({
      message: firstError?.message ?? body?.message ?? response.statusText,
      code: firstError?.code ?? 'UNKNOWN_ERROR',
      status: response.status,
    });
  }

  return body;
}

/**
 * The one `fetch` call site every public service goes through — server-only
 * (no browser bundle, no token/auth machinery needed: every path this
 * calls is a real `@Public()` backend route, see
 * `constants/api-routes.constants.ts`). Uses Next.js's `fetch` extension
 * (`next: { revalidate }`) as the "cache boundary" the milestone brief
 * asks for, rather than inventing a bespoke cache layer.
 */
export async function publicFetch<T>(path: string): Promise<T> {
  return unwrapEnvelope(await fetchEnvelope<T>(path));
}

/**
 * For list endpoints whose envelope carries `meta.pagination`
 * (`GET /public/articles`, `GET /public/categories` — see
 * `apps/backend/src/common/interceptors/response.interceptor.ts`'s
 * `PaginatedResult` special-case). Resolves `{ data, pagination }` instead
 * of the bare array `publicFetch` resolves — additive; `publicFetch` itself
 * is unchanged for every non-paginated call site.
 */
export async function publicFetchPaginated<T>(path: string): Promise<PaginatedFetchResult<T[]>> {
  const envelope = await fetchEnvelope<T[]>(path);
  const data = unwrapEnvelope(envelope);
  return { data, pagination: envelope.meta.pagination! };
}
