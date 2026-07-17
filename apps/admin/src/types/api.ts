/**
 * Mirrors the backend's frozen response envelope exactly —
 * docs/53_API_FREEZE.md "Response Envelope" / "Error Format" /
 * "Pagination". No field here may drift from that contract without a
 * corresponding backend API-freeze amendment.
 */
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

/** The raw envelope shape as it comes over the wire, before the Axios
 * response interceptor unwraps it (lib/api-client.ts). */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta: ApiResponseMeta;
  errors: ApiErrorItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export type SortOrder = 'asc' | 'desc';

export interface SortParams<TSortField extends string = string> {
  sortBy?: TSortField;
  sortOrder?: SortOrder;
}
