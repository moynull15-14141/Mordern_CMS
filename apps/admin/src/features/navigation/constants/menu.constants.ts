import type { MenuItemTargetType } from '../types/menu';

export const NAVIGATION_DEFAULT_PAGE_SIZE = 20;

/** `Menu.location` is an open-ended string on the backend (no enum — a
 * theme can name its own slots without a migration), but the public web
 * app has adopted these three as its own convention
 * (`apps/web/.../menu-locations.constants.ts`) — offered here as
 * one-click suggestions, not an exhaustive/enforced list. A site owner
 * can still type any other value. */
export const SUGGESTED_MENU_LOCATIONS = [
  { value: 'header', label: 'Header' },
  { value: 'footer', label: 'Footer' },
  { value: 'secondary', label: 'Secondary' },
] as const;

export const MENU_ITEM_TARGET_TYPE_LABEL: Record<MenuItemTargetType, string> = {
  PAGE: 'Page',
  ARTICLE: 'Article',
  CATEGORY: 'Category',
  EXTERNAL_URL: 'External link',
  CUSTOM_URL: 'Custom link',
};

export const MENU_STATUS_LABEL = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
} as const;
