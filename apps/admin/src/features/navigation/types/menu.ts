export type MenuStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type MenuItemTargetType = 'PAGE' | 'ARTICLE' | 'CATEGORY' | 'EXTERNAL_URL' | 'CUSTOM_URL';
export type MenuItemOpenMode = 'SELF' | 'BLANK';
export type MenuSortField = 'name' | 'createdAt' | 'updatedAt';

/** Mirrors `PublicMenuItemTreeNodeResponseDto`/the admin `MenuItemResponseDto`
 * — a self-referential tree node, unlimited depth (no maxDepth on the
 * backend model). `children` is always present (empty array, never
 * undefined) so tree code never has to guard for it. */
export interface MenuItem {
  id: string;
  menuId: string;
  parentId: string | null;
  label: string;
  targetType: MenuItemTargetType;
  pageId: string | null;
  articleId: string | null;
  categoryId: string | null;
  url: string | null;
  openMode: MenuItemOpenMode;
  icon: string | null;
  cssClass: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  children: MenuItem[];
}

/** Mirrors `MenuResponseDto` — the same shape for both `GET /menus` (list)
 * and `GET /menus/:id` (detail). `items` is typed optional defensively:
 * if a future list response ever omits the nested tree, table code still
 * degrades to an item count of 0 instead of throwing. */
export interface Menu {
  id: string;
  siteId: string;
  name: string;
  slug: string;
  location: string | null;
  status: MenuStatus;
  items?: MenuItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MenuFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: MenuStatus;
  location?: string;
  sortBy?: MenuSortField;
  sortOrder?: 'asc' | 'desc';
}

/** Mirrors `CreateMenuDto` — no inline items (the backend deliberately
 * only accepts items via the dedicated item endpoints). */
export interface CreateMenuInput {
  name: string;
  slug?: string;
  location?: string;
}

/** Mirrors `UpdateMenuDto`. */
export interface UpdateMenuInput {
  name?: string;
  slug?: string;
  location?: string;
  status?: MenuStatus;
}

/** Mirrors `CreateMenuItemDto` — exactly one of
 * `pageId`/`articleId`/`categoryId`/`url` must be set, matching
 * `targetType` (enforced server-side by `MenusValidator`; the form schema
 * mirrors the same rule client-side for immediate feedback). */
export interface CreateMenuItemInput {
  label: string;
  targetType: MenuItemTargetType;
  pageId?: string;
  articleId?: string;
  categoryId?: string;
  url?: string;
  openMode?: MenuItemOpenMode;
  icon?: string;
  cssClass?: string;
  parentId?: string;
  sortOrder?: number;
}

/** Mirrors `UpdateMenuItemDto` (PATCH semantics, all optional). */
export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;

/** Mirrors `ReorderMenuItemsDto` — one call carries every structural
 * change (reorder, nest, un-nest) as a single normalized list. */
export interface ReorderMenuItemsInput {
  items: { id: string; parentId: string | null; sortOrder: number }[];
}
