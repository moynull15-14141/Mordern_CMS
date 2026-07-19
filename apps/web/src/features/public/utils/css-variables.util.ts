import type { PublicTheme } from '../types/theme.types';

/**
 * Pure transform: `PublicTheme` → CSS custom properties. This is what the
 * milestone brief means by "ThemeProvider produces ... CSS variables" —
 * no new data, just a rendering-agnostic reshape of fields already on the
 * real `/public/theme` response so `PublicLayout` can apply them via a
 * `style` attribute without any component needing to know the theme's
 * field names.
 *
 * Only fields with a value are included — a `null` field (theme hasn't
 * set it) is omitted rather than written as the literal string `"null"`.
 */
export function buildThemeCssVariables(theme: PublicTheme | null): Record<string, string> {
  if (!theme) return {};

  const entries: Array<[string, string | null]> = [
    ['--sportingspy-color-primary', theme.colors.primary],
    ['--sportingspy-color-secondary', theme.colors.secondary],
    ['--sportingspy-container-width', theme.layout.containerWidth],
    ['--sportingspy-border-radius', theme.layout.borderRadius],
  ];

  const variables: Record<string, string> = {};
  for (const [name, value] of entries) {
    if (value !== null) {
      variables[name] = value;
    }
  }
  return variables;
}
