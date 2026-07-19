/**
 * Mirrors the backend's frozen response envelope exactly —
 * `apps/backend/src/core/responses/api-response.ts` (the same contract
 * `apps/admin/src/types/api.ts` mirrors for the admin app). No field here
 * may drift from that contract without a corresponding backend change.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponseMeta {
  requestId?: string;
  timestamp?: string;
  pagination?: PaginationMeta;
}

export interface ApiErrorItem {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta: ApiResponseMeta;
  errors: ApiErrorItem[];
}
