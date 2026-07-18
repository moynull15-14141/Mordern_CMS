export type TagSortField = 'name' | 'slug' | 'createdAt' | 'updatedAt';

/** Mirrors `TagResponseDto` exactly. No `color`/`seo` field — the frozen
 * `Tag` model has neither column (backend's own comment on `CreateTagDto`:
 * "the frozen Tag model has no such column and no generic metadata column
 * to store one in"). */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  synonyms: string[] | null;
  /** Computed live from `ArticleTag` rows — not a stored column. */
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TagFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: TagSortField;
  sortOrder?: 'asc' | 'desc';
}

/** `CreateTagDto` 1:1. */
export interface CreateTagInput {
  name: string;
  slug?: string;
  description?: string;
  synonyms?: string[];
}

/** `UpdateTagDto` 1:1 (PATCH semantics). */
export interface UpdateTagInput {
  name?: string;
  slug?: string;
  description?: string;
  synonyms?: string[];
}
