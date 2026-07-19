import { createElement } from 'react';
import type { RenderContext } from '../../types/render-context.types';
import { PublicRenderer } from '../../renderer/renderer';
import { getThemeRenderer } from '../registry/theme-registry';
import { ThemeHeader } from '../components/theme-header';
import { ThemeFooter } from '../components/theme-footer';
import type { ThemeSlots } from '../slots/types';

/**
 * `ThemeRenderer` — the pipeline stage between Layout and HTML:
 * `Content → Layout → Theme → Renderer → HTML` (Milestone 14.1 inserts
 * "Layout" upstream of this component, in `load-render-context.ts`'s
 * `resolveLayout()` call — see `docs/78_LAYOUT_ENGINE.md`). Resolves
 * `theme.slug -> ThemeRendererDefinition -> Layout -> Slots`, with zero
 * `switch`/`if` chains outside this one function:
 *
 * 1. `getThemeRenderer(context.theme?.slug)` — which renderer definition
 *    (today, always the one default — see `theme-registry.ts`).
 * 2. `context.layout.preset` — which layout preset name. As of Milestone
 *    14.1 this is read directly off `RenderContext`, already decided by
 *    `LayoutResolver` (`layout-engine/resolve-layout.ts`)'s 4-tier
 *    priority chain — `ThemeRenderer` itself no longer calls
 *    `resolveContentArea`/`resolveLayoutPreset` (Milestone 13.4's own
 *    resolution logic, now internal to `LayoutResolver` instead). This is
 *    the milestone brief's own rule: "ThemeRenderer must never know Page /
 *    Article / Homepage / Category directly. It only renders Layout +
 *    Slots + Content."
 * 3. `definition.layouts[preset]` — the actual `Layout` component
 *    (`layout-registry.ts`).
 *
 * `content` is always the real, unchanged `PublicRenderer` output (13.1) —
 * Content never knows Theme (or Layout) exists; Theme only arranges it.
 * `header`/`footer` are always populated (`ThemeHeader`/`ThemeFooter`);
 * `hero`/`beforeContent`/`afterContent`/`sidebar`/`footerCta`/
 * `primaryNavigation` are reserved slots no current content type populates
 * (see docs/77_THEME_RENDERING_SYSTEM.md "Remaining Limitations") —
 * `Home`'s own Hero/Featured/Newsletter/Footer-CTA sections stay exactly
 * as `home-renderer.tsx` (13.3) already composes them, inside the
 * `content` slot, unchanged.
 *
 * `context.layout` is also exposed to any future client descendant via
 * `<LayoutProvider>`/`useLayout()` — composed in `PublicContentProvider`
 * alongside `ThemeProvider`/`NavigationProvider`, not here, so it isn't
 * instantiated twice.
 */
export function ThemeRenderer({ context }: { context: RenderContext }) {
  const rendererDefinition = getThemeRenderer(context.theme?.slug);
  const Layout = rendererDefinition.layouts[context.layout.preset];

  const slots: ThemeSlots = {
    header: <ThemeHeader menus={context.menus} theme={context.theme} settings={context.settings} />,
    content: <PublicRenderer context={context} />,
    footer: <ThemeFooter menus={context.menus} theme={context.theme} settings={context.settings} />,
  };

  // `createElement` (not a JSX tag) — same reasoning as `renderer.tsx`
  // (13.1): `Layout` comes from a registry lookup, not from defining a new
  // component during render.
  return createElement(Layout, { slots, theme: context.theme });
}
