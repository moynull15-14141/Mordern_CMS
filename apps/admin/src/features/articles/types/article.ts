/** Mirrors the real backend enums exactly (`@prisma/client` `ContentStatus`/
 * `ArticleVisibility`, `36_DATABASE_FREEZE.md`). */
export type ContentStatus = 'DRAFT' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';
export type ArticleVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';

/** `constants/article.constants.ts` on the backend — statuses reachable via
 * the generic `PATCH /articles/:id`. PUBLISHED/SCHEDULED require the
 * dedicated `/publish`/`/schedule` endpoints instead. */
export type GenericUpdateStatus = 'DRAFT' | 'REVIEW' | 'ARCHIVED';

export type ArticleSortField = 'title' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'status';

export interface ArticleAuthor {
  id: string;
  penName: string;
  userId: string | null;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleTag {
  id: string;
  name: string;
  slug: string;
  primary: boolean;
}

export interface ArticleSeo {
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

export interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  summary: string | null;
  body: unknown;
  status: ContentStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  visibility: ArticleVisibility;
  language: string;
  locale: string;
  canonicalUrl: string | null;
  readingTime: number | null;
  wordCount: number | null;
  notes: string | null;
  featuredMediaId: string | null;
  author: ArticleAuthor;
  category: ArticleCategory | null;
  tags: ArticleTag[];
  seo: ArticleSeo | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  status?: ContentStatus;
  visibility?: ArticleVisibility;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
  publishedFrom?: string;
  publishedTo?: string;
  sortBy?: ArticleSortField;
  sortOrder?: 'asc' | 'desc';
}

/** `CreateArticleDto` 1:1 — no `status` field exists; the backend assigns
 * the initial status (DRAFT) server-side. */
export interface CreateArticleInput {
  title: string;
  subtitle?: string;
  slug?: string;
  summary?: string;
  body: Record<string, unknown>;
  authorId: string;
  primaryCategoryId?: string;
  tagIds?: string[];
  primaryTagId?: string;
  visibility?: ArticleVisibility;
  language: string;
  locale: string;
  featuredMediaId?: string;
  notes?: string;
  seo?: ArticleSeo;
}

/** `UpdateArticleDto` 1:1 (PATCH semantics — every field optional). */
export interface UpdateArticleInput {
  title?: string;
  subtitle?: string;
  slug?: string;
  summary?: string;
  body?: Record<string, unknown>;
  status?: GenericUpdateStatus;
  primaryCategoryId?: string;
  tagIds?: string[];
  primaryTagId?: string;
  visibility?: ArticleVisibility;
  featuredMediaId?: string;
  notes?: string;
  seo?: ArticleSeo;
  revisionComment?: string;
}

export interface ScheduleArticleInput {
  scheduledAt: string;
}

export interface ArticleRevision {
  version: number;
  title: string;
  summary: string | null;
  body: unknown;
  status: ContentStatus;
  authorId: string;
  comment: string | null;
  createdAt: string;
}

export interface ArticleRevisionMetadata {
  version: number;
  title: string;
  summary: string | null;
  status: ContentStatus;
  authorId: string;
  wordCount: number;
  createdAt: string;
  comment: string | null;
}

export interface ArticleRevisionCompare {
  from: ArticleRevisionMetadata;
  to: ArticleRevisionMetadata;
}

/** Minimal shapes for the Category/Tag selectors this milestone builds —
 * not a full Categories/Tags feature (out of scope; see docs/65 "Known
 * Limitations"). The Media selector now reuses the full `Media` type from
 * `features/media` (Frontend Milestone 7) instead of a local subset. */
export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface TagOption {
  id: string;
  name: string;
  slug: string;
}
