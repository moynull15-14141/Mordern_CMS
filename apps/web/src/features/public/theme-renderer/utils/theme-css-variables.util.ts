import type { PublicTheme } from '../../types/theme.types';

function stringField(source: Record<string, unknown> | null, key: string): string | undefined {
  const value = source?.[key];
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/**
 * Extends `utils/css-variables.util.ts`'s `buildThemeCssVariables` (13.1,
 * unchanged) with the additional real/derived variables the Theme
 * Rendering System's components read. Deliberately a *new*, additive
 * function rather than a change to the 13.1 one — `PublicLayout`'s
 * existing base-variable application keeps working exactly as before;
 * `ThemeRenderer` applies this superset on its own inner wrapper.
 *
 * Every variable here is either a real theme field or a value *derived*
 * from one (never invented / never a fake backend field — Rule Zero, "Do
 * NOT invent theme settings"):
 * - `--sportingspy-color-accent` — `colors.secondary` if set, else
 *   `colors.primary`, else omitted. Real data, no computed color math.
 * - `--sportingspy-radius` — mirrors `layout.borderRadius`
 *   (`--sportingspy-border-radius` from 13.1 is left as-is; this is an
 *   additional alias some new components read).
 * - `--sportingspy-container-width` — same real field as 13.1.
 * - `--sportingspy-font-family` — `typography.fontFamily` if that key
 *   exists and is a non-empty string (`typography` is free-form JSON with
 *   no fixed schema — see `theme.types.ts` — so this is read
 *   defensively, exactly like `metadata.util.ts` reads `openGraph`).
 *
 * Static, non-theme-sourced tokens (`background`/`surface`/`border`/
 * `text`/`muted`/spacing scale) are deliberately NOT produced here — they
 * live in `styles/globals.css` as fixed design-system defaults (with a
 * `prefers-color-scheme: dark` override), since no backend field for any
 * of them exists. See `docs/77_THEME_RENDERING_SYSTEM.md` "CSS Variable
 * Strategy".
 */
export function buildExtendedThemeCssVariables(theme: PublicTheme | null): Record<string, string> {
  if (!theme) return {};

  const accent = theme.colors.secondary ?? theme.colors.primary;
  const fontFamily = stringField(theme.typography, 'fontFamily');

  const entries: Array<[string, string | null | undefined]> = [
    ['--sportingspy-color-primary', theme.colors.primary],
    ['--sportingspy-color-secondary', theme.colors.secondary],
    ['--sportingspy-color-accent', accent],
    ['--sportingspy-radius', theme.layout.borderRadius],
    ['--sportingspy-container-width', theme.layout.containerWidth],
    ['--sportingspy-font-family', fontFamily],
  ];

  const variables: Record<string, string> = {};
  for (const [name, value] of entries) {
    if (value) {
      variables[name] = value;
    }
  }
  return variables;
}
