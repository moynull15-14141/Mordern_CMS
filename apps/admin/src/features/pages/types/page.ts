/** Mirrors the real backend enums exactly (`@prisma/client` `ContentStatus`).
 * `Page` has no `visibility`/`language`/`locale`/`authorId`/`parentId`
 * column — see `apps/backend/src/modules/pages`. */
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';

/** Status values reachable via the generic `PATCH /pages/:id` — PUBLISHED
 * is excluded (requires `/publish`), matching the backend's own
 * `GENERIC_UPDATE_ALLOWED_STATUSES`. No SCHEDULED path exists for Pages at
 * all (no `scheduledAt` column), unlike Articles. */
export type GenericUpdateStatus = 'DRAFT' | 'REVIEW' | 'ARCHIVED';

export type PageSortField = 'title' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'status';

export interface PageSeo {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string[];
  openGraph?: Record<string, unknown>;
  twitterCard?: Record<string, unknown>;
  schemaJson?: Record<string, unknown>;
  robots?: Record<string, unknown>;
  extraMeta?: Record<string, unknown>;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  body: unknown;
  status: ContentStatus;
  publishedAt: string | null;
  seo: PageSeo | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PageFilters {
  page?: number;
  limit?: number;
  status?: ContentStatus;
  search?: string;
  sortBy?: PageSortField;
  sortOrder?: 'asc' | 'desc';
}

/** `CreatePageDto` 1:1 — no `status` field; the backend assigns the
 * initial status (DRAFT) server-side, same as Articles. */
export interface CreatePageInput {
  title: string;
  slug?: string;
  body: Record<string, unknown>;
  seo?: PageSeo;
}

/** `UpdatePageDto` 1:1 (PATCH semantics — every field optional). */
export interface UpdatePageInput {
  title?: string;
  slug?: string;
  body?: Record<string, unknown>;
  status?: GenericUpdateStatus;
  seo?: PageSeo;
}
