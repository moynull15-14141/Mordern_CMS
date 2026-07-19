import { MENU_LOCATIONS } from '../constants/menu-locations.constants';
import { DEFAULT_LOCALE } from '../constants/rendering.constants';
import { getActiveTheme } from '../services/theme.service';
import { getMenuByLocation } from '../services/navigation.service';
import { getCurrentSite } from '../services/site.service';
import { getPublicSettings } from '../services/settings.service';
import { resolveLayout } from '../layout-engine/resolve-layout';
import type { RenderContext } from '../types/render-context.types';
import type { ResolvedPublicContent } from '../types/content.types';
import type { PublicSeo } from '../types/seo.types';

function seoFor(content: ResolvedPublicContent): PublicSeo | null {
  return 'seo' in content ? content.seo : null;
}

/**
 * Assembles one `RenderContext` per request — every real load (theme,
 * header/footer/secondary menus, site, settings, resolved content) happens
 * exactly once here, then gets threaded down via `PublicContentProvider`
 * (Architecture Requirements: "No duplicated fetch logic"). This is the
 * "Route → Resolver → RenderContext → Renderer" pipeline's assembly point.
 *
 * Takes the already-resolved (or in-flight) content rather than a
 * pathname: the three slug-addressed detail routes pass
 * `resolveContent(pathname)`, while `/` and `/blog` pass their own
 * `loadHomeContent()`/`loadBlogListContent(searchParams)` — see
 * `resolver/content-resolver.ts` and `route-shape.util.ts`'s doc comments
 * for why those two routes don't share the slug matcher. Every route still
 * goes through this one function, so theme/menu/site/settings loading is
 * never duplicated per route type.
 *
 * `getActiveTheme`/`getMenuByLocation`/`getCurrentSite`/`getPublicSettings`
 * are each wrapped in React's `cache()` at their definition — calling them
 * again from `app/layout.tsx` (for `<html lang>`/favicon/title metadata)
 * dedupes to the same in-flight request within one render pass, never a
 * second network call.
 *
 * Two phases, not one flat `Promise.all` (Milestone 14.1) —
 * `resolveLayout()` (`layout-engine/resolve-layout.ts`) genuinely needs
 * both `theme` and the resolved `content` before it can run (it reads
 * `theme.layout.homepage`/`.blog` and `content.type`/`.slug`), so `theme`
 * and `content` resolve first; every other independent fetch
 * (menus/site/settings) still runs in parallel with `resolveLayout` itself
 * in the second phase, rather than after it.
 */
export async function loadRenderContext(
  content: ResolvedPublicContent | Promise<ResolvedPublicContent>
): Promise<RenderContext> {
  const [theme, resolvedContent] = await Promise.all([getActiveTheme(), content]);

  const [header, footer, secondary, site, settings, layout] = await Promise.all([
    getMenuByLocation(MENU_LOCATIONS.HEADER),
    getMenuByLocation(MENU_LOCATIONS.FOOTER),
    getMenuByLocation(MENU_LOCATIONS.SECONDARY),
    getCurrentSite().catch(() => null),
    getPublicSettings().catch(() => null),
    resolveLayout(resolvedContent, theme),
  ]);

  return {
    theme,
    menus: { header, footer, secondary },
    site,
    settings,
    locale: site?.locale ?? DEFAULT_LOCALE,
    seo: seoFor(resolvedContent),
    content: resolvedContent,
    layout,
  };
}
