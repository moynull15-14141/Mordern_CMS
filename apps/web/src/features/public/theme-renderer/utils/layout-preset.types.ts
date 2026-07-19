/**
 * Layout preset names — this app's own convention for interpreting the
 * real, open-ended `theme.layout.homepage`/`theme.layout.blog` string
 * fields (`PublicThemeResponseDto`, verified against the backend DTO).
 * Neither field is a backend enum — an admin can type anything — so this
 * is a closed vocabulary of the values *this app* recognizes; an
 * unrecognized or absent value falls back to `'default'`
 * (`resolve-layout-preset.util.ts`), never an error.
 */
export const LAYOUT_PRESET_NAMES = [
  'default',
  'full-width',
  'boxed',
  'centered',
  'sidebar-left',
  'sidebar-right',
  'no-sidebar',
] as const;

export type LayoutPresetName = (typeof LAYOUT_PRESET_NAMES)[number];

/** Which real theme field a route's content type reads its layout preset
 * from. `Page`/`Category`/`not-found` have no dedicated theme field
 * (`PublicThemeLayout` only has `homepage`/`blog`) — they always resolve
 * to `'default'`, not a guessed/invented field. */
export type LayoutContentArea = 'home' | 'blog' | 'default';

/** Exported shape guard (Milestone 14.1's `LayoutResolver` needs this to
 * validate a Layout Engine `layoutPreset` string — a completely
 * open-ended backend field, same as `theme.layout.homepage`/`.blog` — is
 * one of the presets this app's registry actually has a component for,
 * before treating that tier as having "fired"). */
export function isKnownLayoutPresetName(
  value: string | null | undefined
): value is LayoutPresetName {
  return (LAYOUT_PRESET_NAMES as readonly string[]).includes(value ?? '');
}
