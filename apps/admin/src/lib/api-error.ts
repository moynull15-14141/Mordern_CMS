import type { ApiErrorItem } from '@/types/api';

/**
 * Typed error thrown by the Axios response interceptor whenever the
 * backend's envelope has `success: false`, or the request fails outright
 * (network/5xx). Mirrors docs/53_API_FREEZE.md "Error Format" /
 * docs/55_FRONTEND_HANDOFF.md "Error Handling": `.code` for programmatic
 * branching (stable), `.message` for display (may be reworded).
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly requestId?: string;
  readonly details?: unknown;
  readonly errors: ApiErrorItem[];

  constructor(params: {
    message: string;
    code: string;
    status?: number;
    requestId?: string;
    details?: unknown;
    errors?: ApiErrorItem[];
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.requestId = params.requestId;
    this.details = params.details;
    this.errors = params.errors ?? [];
  }

  get isNotFound(): boolean {
    return this.code === 'BUSINESS_NOT_FOUND' || this.status === 404;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isValidation(): boolean {
    return this.code.startsWith('VALIDATION_');
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }
}

/** Type guard, since Axios/fetch failures may throw non-ApiError values
 * (e.g. a genuinely unexpected runtime error) — callers should always
 * narrow before reading `.code`. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
