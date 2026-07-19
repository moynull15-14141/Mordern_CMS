import { LAYOUT_REGISTRY } from './layout-registry';
import type { LayoutPresetName } from '../utils/layout-preset.types';
import type { ThemeLayoutComponent } from '../layouts/layout-types';

/**
 * What a registered theme renderer provides — today, just a layout
 * registry. `theme slug -> Theme Renderer -> Layout -> Slots` (milestone
 * brief) resolves through this definition: `ThemeRenderer` looks up a
 * `ThemeRendererDefinition` by slug, then looks up a `Layout` inside
 * *that* definition's own layout registry — never a global `switch` on
 * slug anywhere else in the app.
 */
export interface ThemeRendererDefinition {
  layouts: Record<LayoutPresetName, ThemeLayoutComponent>;
}

const DEFAULT_THEME_RENDERER: ThemeRendererDefinition = {
  layouts: LAYOUT_REGISTRY,
};

/**
 * Keyed by real `Theme.slug` (`PublicThemeResponseDto.slug`). Empty today
 * — every theme this backend can produce renders through
 * `DEFAULT_THEME_RENDERER`, since only one rendering system exists. This
 * is the seam a future Theme Marketplace milestone (`77_THEME_RENDERING_SYSTEM.md`
 * "Future Visual Builder Integration") registers additional,
 * slug-specific definitions into — e.g. a purchased/installed theme that
 * ships its own layout set — without changing `ThemeRenderer` itself.
 */
const THEME_RENDERER_REGISTRY: Record<string, ThemeRendererDefinition> = {};

/** Never throws and never returns `undefined` — an unregistered or
 * unknown slug (every real slug today) resolves to the default renderer,
 * not an error. */
export function getThemeRenderer(themeSlug: string | null | undefined): ThemeRendererDefinition {
  if (themeSlug && THEME_RENDERER_REGISTRY[themeSlug]) {
    return THEME_RENDERER_REGISTRY[themeSlug];
  }
  return DEFAULT_THEME_RENDERER;
}
