import type { BlockNode } from '@/features/block-editor';

export type PatternStatus = 'ACTIVE' | 'ARCHIVED';
export type PatternSortField = 'name' | 'createdAt' | 'updatedAt';
export type PatternUsageContentType = 'page' | 'article' | 'reusable-block';

/** Mirrors `PatternUsageReferenceDto`. Always a detached-copy "inserted
 * from" provenance signal, never a live reference — insertion always
 * copies the block tree with fresh ids. */
export interface PatternUsageReference {
  contentType: PatternUsageContentType;
  id: string;
  title: string;
  slug?: string;
}

/** Mirrors `PatternResponseDto` 1:1 — the full shape, including `body`. */
export interface Pattern {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  tags: string[];
  status: PatternStatus;
  thumbnailMediaId: string | null;
  body: { blocks: BlockNode[] };
  version: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Mirrors `PatternSummaryDto` — the lightweight shape list/grid views use
 * (no `body`, only a `blockCount` signal — see `PatternMapper.toSummaryDto`'s
 * "don't render every pattern in full detail on the list page" reasoning). */
export interface PatternSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  tags: string[];
  status: PatternStatus;
  thumbnailMediaId: string | null;
  blockCount: number;
  version: number;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PatternFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  /** Comma-separated on the wire — matches any (OR). */
  tags?: string;
  status?: PatternStatus;
  sortBy?: PatternSortField;
  sortOrder?: 'asc' | 'desc';
}

/** Mirrors `CreatePatternDto` 1:1. */
export interface CreatePatternInput {
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnailMediaId?: string;
  body: { blocks: BlockNode[] };
}

/** Mirrors `UpdatePatternDto` 1:1 (PATCH semantics). */
export interface UpdatePatternInput {
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnailMediaId?: string;
  body?: { blocks: BlockNode[] };
}
