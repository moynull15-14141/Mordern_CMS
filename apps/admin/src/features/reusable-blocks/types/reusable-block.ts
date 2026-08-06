import type { BlockNode } from '@/features/block-editor';

export type ReusableBlockContentType = 'page' | 'article';

/** Mirrors `ReusableBlockUsageReferenceDto`. */
export interface ReusableBlockUsageReference {
  contentType: ReusableBlockContentType;
  id: string;
  title: string;
  slug: string;
}

export type ReusableBlockSortField = 'name' | 'createdAt' | 'updatedAt';

/** Mirrors `ReusableBlockResponseDto` 1:1. */
export interface ReusableBlock {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  blockType: string;
  data: Record<string, unknown>;
  children: BlockNode[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ReusableBlockFilters {
  page?: number;
  limit?: number;
  search?: string;
  blockType?: string;
  sortBy?: ReusableBlockSortField;
  sortOrder?: 'asc' | 'desc';
}

/** Mirrors `CreateReusableBlockDto` 1:1. */
export interface CreateReusableBlockInput {
  name: string;
  description?: string;
  category?: string;
  blockType: string;
  data: Record<string, unknown>;
  children?: BlockNode[];
}

/** Mirrors `UpdateReusableBlockDto` 1:1 (PATCH semantics — `blockType` is
 * never editable, see the backend DTO's own doc comment). */
export interface UpdateReusableBlockInput {
  name?: string;
  description?: string;
  category?: string;
  data?: Record<string, unknown>;
  children?: BlockNode[];
}
