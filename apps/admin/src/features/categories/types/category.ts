/** Mirrors the real backend `CategoryStatus` enum exactly (`@prisma/client`,
 * `36_DATABASE_FREEZE.md`). */
export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export type CategorySortField = 'name' | 'slug' | 'sortOrder' | 'createdAt' | 'updatedAt';

export interface CategorySeo {
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: CategoryStatus;
  parentId: string | null;
  sortOrder: number | null;
  /** Computed live from `Article.primaryCategoryId` — not a stored column. */
  articleCount: number;
  /** Computed live from active child categories — not a stored column. */
  childrenCount: number;
  seo: CategorySeo | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CategoryBreadcrumbItem {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  status?: CategoryStatus;
  parentId?: string;
  search?: string;
  sortBy?: CategorySortField;
  sortOrder?: 'asc' | 'desc';
}

/** `CreateCategoryDto` 1:1. */
export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  seo?: CategorySeo;
}

/** `UpdateCategoryDto` 1:1 (PATCH semantics). No `parentId` — parent
 * changes go through the dedicated `/categories/:id/move` endpoint. */
export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  status?: CategoryStatus;
  sortOrder?: number;
  seo?: CategorySeo;
}

/** `MoveCategoryDto` 1:1 — omit/null `parentId` moves to root. */
export interface MoveCategoryInput {
  parentId?: string | null;
}
