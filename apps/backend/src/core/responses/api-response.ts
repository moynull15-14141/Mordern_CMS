import { ErrorCode } from '../exceptions/codes';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponseMeta {
  requestId?: string;
  timestamp: string;
  pagination?: PaginationMeta;
}

export interface ApiErrorItem {
  code: ErrorCode | string;
  message: string;
  details?: unknown;
}

/**
 * Frozen V1 API envelope (Milestone 2.1). Every response — success or
 * error — uses this single shape; do not change it without updating
 * docs/20_BACKEND_ARCHITECTURE.md §13 in the same change.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  meta: ApiResponseMeta;
  errors: ApiErrorItem[];
}

export function buildSuccessResponse<T>(
  data: T,
  options: { message?: string; meta?: Partial<ApiResponseMeta> } = {},
): ApiResponse<T> {
  return {
    success: true,
    message: options.message ?? '',
    data,
    meta: { timestamp: new Date().toISOString(), ...options.meta },
    errors: [],
  };
}

export function buildErrorResponse(
  errors: ApiErrorItem[],
  options: { message?: string; meta?: Partial<ApiResponseMeta> } = {},
): ApiResponse<null> {
  return {
    success: false,
    message: options.message ?? errors[0]?.message ?? 'Request failed',
    data: null,
    meta: { timestamp: new Date().toISOString(), ...options.meta },
    errors,
  };
}
