/**
 * Mirrors `PublicMenuResponseDto` / `PublicMenuItemTreeNodeResponseDto`
 * (`apps/backend/src/modules/menus/dto/public-menu-*response.dto.ts`)
 * field-for-field — the real, live response shape of
 * `GET /public/menus/:location` and `GET /public/menus/slug/:slug`.
 * `targetType`/`openMode` string unions mirror the Prisma enums
 * `MenuItemTargetType`/`MenuItemOpenMode` (`config/prisma/schema.prisma`)
 * exactly — no value added or removed.
 */
export type PublicMenuItemTargetType =
  'PAGE' | 'ARTICLE' | 'CATEGORY' | 'EXTERNAL_URL' | 'CUSTOM_URL';
export type PublicMenuItemOpenMode = 'SELF' | 'BLANK';

export interface PublicMenuItem {
  id: string;
  label: string;
  targetType: PublicMenuItemTargetType;
  url: string | null;
  resolvedUrl: string;
  isExternal: boolean;
  targetSlug: string | null;
  openMode: PublicMenuItemOpenMode;
  icon: string | null;
  cssClass: string | null;
  children: PublicMenuItem[];
}

export interface PublicMenu {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  items: PublicMenuItem[];
}
