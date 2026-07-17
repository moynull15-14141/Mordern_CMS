/** Single source for every localStorage/sessionStorage key this app uses —
 * never a hand-typed string literal at a call site. */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin.auth.accessToken',
  REFRESH_TOKEN: 'admin.auth.refreshToken',
  THEME: 'admin.theme',
  SIDEBAR_COLLAPSED: 'admin.ui.sidebarCollapsed',
} as const;
