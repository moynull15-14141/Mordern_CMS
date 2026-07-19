import type { PublicTheme } from '../../types/theme.types';
import {
  LAYOUT_PRESET_NAMES,
  type LayoutContentArea,
  type LayoutPresetName,
} from './layout-preset.types';

const DEFAULT_PRESET: LayoutPresetName = 'default';

function isKnownPreset(value: string | null | undefined): value is LayoutPresetName {
  return (LAYOUT_PRESET_NAMES as readonly string[]).includes(value ?? '');
}

/**
 * Resolves which `LayoutPresetName` a route should render with, reading
 * only the real theme fields that exist:
 * - `area: 'home'` → `theme.layout.homepage`
 * - `area: 'blog'` → `theme.layout.blog` (used by both `/blog` and
 *   `/blog/[slug]` — the model has one `blog` field, not separate
 *   list/detail fields)
 * - `area: 'default'` → always `'default'` — `Page`/`Category`/`not-found`
 *   have no dedicated theme layout field to read (see
 *   `layout-preset.types.ts`'s doc comment)
 *
 * A `null` theme, a `null` field, or a string this app doesn't recognize
 * (an admin can type anything into an open-ended field) all fall back to
 * `'default'` — never a thrown error, never a guess.
 */
export function resolveLayoutPreset(
  theme: PublicTheme | null,
  area: LayoutContentArea
): LayoutPresetName {
  if (!theme) return DEFAULT_PRESET;

  const rawValue =
    area === 'home' ? theme.layout.homepage : area === 'blog' ? theme.layout.blog : null;

  return isKnownPreset(rawValue) ? rawValue : DEFAULT_PRESET;
}
