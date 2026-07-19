/** Mirrors the real backend `LayoutAssignmentContentType` enum exactly
 * (Backend Milestone 14.1). HOMEPAGE never has an entity id — there is no
 * `Homepage` model, exactly one per site. */
export type LayoutAssignmentContentType = 'HOMEPAGE' | 'PAGE' | 'ARTICLE' | 'CATEGORY';

export interface LayoutAssignment {
  id: string;
  layoutId: string;
  contentType: LayoutAssignmentContentType;
  pageId: string | null;
  articleId: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * `AssignLayoutDto` 1:1 — upsert semantics server-side (assigning twice to
 * the identical target updates the existing row's `layoutId` rather than
 * erroring). Leave `pageId`/`articleId`/`categoryId` all unset for a
 * content-type-wide default (PAGE/ARTICLE/CATEGORY only); set exactly the
 * one matching `contentType` for an instance-specific assignment;
 * `contentType: 'HOMEPAGE'` must never set any of the three.
 */
export interface AssignLayoutInput {
  layoutId: string;
  contentType: LayoutAssignmentContentType;
  pageId?: string;
  articleId?: string;
  categoryId?: string;
}
