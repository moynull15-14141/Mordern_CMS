/** Mirrors the real backend `ThemeStatus` enum exactly
 * (`apps/backend/src/modules/themes`). */
export type ThemeStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type ThemeSortField = 'name' | 'createdAt' | 'updatedAt' | 'status';

/** Mirrors `ThemeSettingsDto` 1:1 — every field optional, `typography` is
 * an open-ended JSON object (no fixed sub-field set on the backend). */
export interface ThemeSettings {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  typography?: Record<string, unknown>;
  headerLayout?: string;
  footerLayout?: string;
  containerWidth?: string;
  borderRadius?: string;
  buttonStyle?: string;
  homepageLayout?: string;
  blogLayout?: string;
  customCss?: string;
  customJs?: string;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  version: string | null;
  author: string | null;
  description: string | null;
  thumbnail: string | null;
  status: ThemeStatus;
  isActive: boolean;
  settings: ThemeSettings | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ThemeFilters {
  page?: number;
  limit?: number;
  status?: ThemeStatus;
  isActive?: boolean;
  search?: string;
  sortBy?: ThemeSortField;
  sortOrder?: 'asc' | 'desc';
}

/** `CreateThemeDto` 1:1 — no `status`/`isActive` field; every created
 * theme starts DRAFT and inactive server-side. */
export interface CreateThemeInput {
  name: string;
  slug?: string;
  version?: string;
  author?: string;
  description?: string;
  thumbnail?: string;
  settings?: ThemeSettings;
}

/** `UpdateThemeDto` 1:1 (PATCH semantics — every field optional). No
 * `isActive` — that only ever changes via `POST /themes/:id/activate`. */
export interface UpdateThemeInput {
  name?: string;
  slug?: string;
  version?: string;
  author?: string;
  description?: string;
  thumbnail?: string;
  status?: ThemeStatus;
  settings?: ThemeSettings;
}
