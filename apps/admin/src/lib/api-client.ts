import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/lib/env';
import { tokenStore } from '@/lib/token-store';
import { ApiError } from '@/lib/api-error';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { ApiEnvelope, ApiResponseMeta } from '@/types/api';
import type { AuthTokens } from '@/types/auth';

/**
 * The ONE Axios instance for the whole app — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md
 * "API Layer". No feature module constructs its own client or reimplements
 * pagination/error handling (docs/59_FRONTEND_CODING_GUIDELINES.md).
 * Infrastructure only, per Frontend Milestone 1 — no resource-specific
 * service function is defined in this file.
 */
export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/** Marks a request as exempt from the Bearer-token/401-refresh machinery —
 * used by the 6 `@Public()` Identity endpoints (docs/53_API_FREEZE.md
 * "Authentication"), e.g. `api.post(LOGIN, credentials, { public: true })`.
 *
 * `paginated` (Frontend Milestone 3): opt-in flag so a list endpoint can
 * resolve `{ data, meta }` instead of the bare `data` every other call site
 * already gets — additive only, default behavior for every existing caller
 * is unchanged (see `api.getPaginated()` below). */
export interface RequestOptions extends AxiosRequestConfig {
  public?: boolean;
  paginated?: boolean;
}
type PublicRequestConfig = RequestOptions;

/** Resolved shape for a `paginated: true` request — mirrors the backend's
 * envelope 1:1 (`meta.pagination`, `53_API_FREEZE.md` "Pagination") rather
 * than inventing a different shape than what's already on the wire. */
export interface PaginatedResponse<T> {
  data: T;
  meta: ApiResponseMeta;
}

/** Invoked once a refresh attempt has definitively failed — the Auth
 * Provider subscribes to this to clear state and redirect to /login,
 * keeping this plain module free of any React/Next.js navigation import
 * (docs/56 "Authentication": "clear session, redirect to /login"). */
type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;
export function onSessionExpired(listener: UnauthorizedListener): () => void {
  unauthorizedListener = listener;
  return () => {
    if (unauthorizedListener === listener) unauthorizedListener = null;
  };
}

// --- Request Interceptor: token injection ---
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const isPublic = (config as PublicRequestConfig).public === true;
  if (!isPublic) {
    const token = tokenStore.getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

// --- Refresh Queue: one in-flight refresh, queued requests replay after ---
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) {
    throw new ApiError({
      message: 'No refresh token available.',
      code: 'AUTH_NO_REFRESH_TOKEN',
      status: 401,
    });
  }

  const response = await axios.post<ApiEnvelope<AuthTokens>>(
    `${env.NEXT_PUBLIC_API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const tokens = response.data.data;
  tokenStore.setTokens(tokens);
  return tokens.accessToken;
}

/** Retry-queue: attempts exactly one refresh per 401 storm, replaying every
 * queued request with the new token — docs/55_FRONTEND_HANDOFF.md's
 * "refresh-on-401-retry-once" pattern, implemented once as shared
 * infrastructure. */
async function handleUnauthorized<T>(
  originalConfig: InternalAxiosRequestConfig,
): Promise<T | PaginatedResponse<T>> {
  try {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newAccessToken = await refreshPromise;

    originalConfig.headers.set('Authorization', `Bearer ${newAccessToken}`);
    const retried = await apiClient.request<ApiEnvelope<T>>(originalConfig);
    const paginated = (originalConfig as PublicRequestConfig).paginated === true;
    return unwrapEnvelope(retried.data, paginated);
  } catch (refreshError) {
    tokenStore.clearTokens();
    unauthorizedListener?.();
    throw toApiError(refreshError);
  }
}

function unwrapEnvelope<T>(envelope: ApiEnvelope<T>, paginated?: boolean): T | PaginatedResponse<T> {
  if (!envelope.success) {
    throw new ApiError({
      message: envelope.errors[0]?.message ?? envelope.message,
      code: envelope.errors[0]?.code ?? 'UNKNOWN_ERROR',
      requestId: envelope.meta?.requestId,
      errors: envelope.errors,
    });
  }
  if (paginated) {
    return { data: envelope.data, meta: envelope.meta };
  }
  return envelope.data;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
    const responseBody = axiosError.response?.data;

    if (!axiosError.response) {
      return new ApiError({
        message: 'Network error — please check your connection.',
        code: 'NETWORK_ERROR',
      });
    }

    const firstError = responseBody?.errors?.[0];
    return new ApiError({
      message: firstError?.message ?? responseBody?.message ?? axiosError.message,
      code: firstError?.code ?? 'UNKNOWN_ERROR',
      status: axiosError.response.status,
      requestId: responseBody?.meta?.requestId,
      details: firstError?.details,
      errors: responseBody?.errors ?? [],
    });
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
  return new ApiError({ message, code: 'UNKNOWN_ERROR' });
}

// --- Response Interceptor: envelope unwrap + 401 refresh + error mapping ---
apiClient.interceptors.response.use(
  // Explicit `: any` return annotation is required here (not just for
  // style) — without it, TypeScript's contextual typing tries to reconcile
  // unwrapEnvelope's `T | PaginatedResponse<T>` union against Axios's own
  // interceptor signature (which statically expects an AxiosResponse back,
  // even though nothing at runtime enforces that — see the "Typed wrapper
  // functions" comment below), producing a nonsensical inferred generic
  // and a real `next build` type-check failure. The runtime behavior is
  // unchanged either way; only the type-checker's inference path is fixed.
  (response): any => {
    const paginated = (response.config as PublicRequestConfig)?.paginated === true;
    return unwrapEnvelope(response.data, paginated);
  },
  // Same `: any` reasoning as the fulfilled handler above.
  async (error: AxiosError<ApiEnvelope<unknown>>): Promise<any> => {
    const originalConfig = error.config as
      (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isPublic = (originalConfig as PublicRequestConfig | undefined)?.public === true;

    if (error.response?.status === 401 && originalConfig && !originalConfig._retried && !isPublic) {
      originalConfig._retried = true;
      return handleUnauthorized(originalConfig);
    }

    throw toApiError(error);
  }
);

/**
 * Typed wrapper functions — Axios's own static types describe
 * `Promise<AxiosResponse<T>>`, but the response interceptor above already
 * unwraps the envelope at runtime and resolves with the bare `T`/rejects
 * with `ApiError`. These wrappers make the compile-time type match actual
 * runtime behavior; every call site (providers, future feature services)
 * uses these instead of `apiClient.get`/`.post`/etc directly.
 */
export const api = {
  get<T>(url: string, config?: RequestOptions): Promise<T> {
    return apiClient.get(url, config) as unknown as Promise<T>;
  },
  /** Frontend Milestone 3: for list endpoints whose `data` is an array and
   * whose `meta.pagination` a caller needs (`53_API_FREEZE.md` "Pagination")
   * — resolves `{ data, meta }` instead of the bare array every other `get`
   * call site still gets. Additive only; `api.get()` is unchanged. */
  getPaginated<T>(url: string, config?: RequestOptions): Promise<PaginatedResponse<T>> {
    const paginatedConfig: RequestOptions = { ...config, paginated: true };
    return apiClient.get(url, paginatedConfig) as unknown as Promise<PaginatedResponse<T>>;
  },
  post<T>(url: string, data?: unknown, config?: RequestOptions): Promise<T> {
    return apiClient.post(url, data, config) as unknown as Promise<T>;
  },
  patch<T>(url: string, data?: unknown, config?: RequestOptions): Promise<T> {
    return apiClient.patch(url, data, config) as unknown as Promise<T>;
  },
  put<T>(url: string, data?: unknown, config?: RequestOptions): Promise<T> {
    return apiClient.put(url, data, config) as unknown as Promise<T>;
  },
  delete<T>(url: string, config?: RequestOptions): Promise<T> {
    return apiClient.delete(url, config) as unknown as Promise<T>;
  },
};
