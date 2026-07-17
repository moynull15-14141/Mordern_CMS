/** docs/57_DESIGN_SYSTEM.md "Theme" — Light / Dark / System, via next-themes. */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

export const DEFAULT_THEME: Theme = THEMES.SYSTEM;
