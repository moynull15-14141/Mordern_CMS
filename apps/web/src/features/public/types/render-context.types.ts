import type { PublicTheme } from './theme.types';
import type { PublicMenu } from './navigation.types';
import type { PublicSeo } from './seo.types';
import type { ResolvedPublicContent } from './content.types';
import type { PublicSite } from './site.types';
import type { PublicSetting } from './settings.types';
import type { LayoutResolution } from '../layout-engine/types';

/**
 * The nav slots `NavigationProvider` exposes — mirrors the milestone
 * brief's "header menu / footer menu / secondary menu". Backing data comes
 * from the real `GET /public/menus/:location` endpoint, whose `location`
 * param is an open-ended string (`Menu.location` doc comment,
 * `config/prisma/schema.prisma`) — these three are this app's own naming
 * convention for that param, not a backend enum. A location with no
 * published menu resolves to `null`, not an error (see
 * `navigation.service.ts`).
 */
export interface PublicNavigationMenus {
  header: PublicMenu | null;
  footer: PublicMenu | null;
  secondary: PublicMenu | null;
}

/**
 * `RenderContext` — the single source of truth every renderer reads from
 * ("No page should know where theme/menus/settings come from. Everything
 * must come through RenderContext."). Assembled once per request by
 * `renderer/load-render-context.ts` and threaded down instead of being
 * re-fetched.
 *
 * `site`/`settings` are real as of Milestone 13.3 (`GET /public/site` /
 * `GET /public/settings` — see docs/75_BACKEND_PUBLIC_CONTENT_API.md).
 * Both resolve to `null` only on a genuine fetch failure — see
 * `site.service.ts`/`settings.service.ts`.
 */
export interface RenderContext {
  theme: PublicTheme | null;
  menus: PublicNavigationMenus;
  settings: PublicSetting[] | null;
  site: PublicSite | null;
  locale: string;
  seo: PublicSeo | null;
  content: ResolvedPublicContent;
  /**
   * The resolved Layout Engine decision (Milestone 14.1) —
   * `LayoutResolver`'s output, computed once per request by
   * `resolve-layout.ts` as part of `loadRenderContext`. `ThemeRenderer`
   * reads `layout.preset` to pick a `LAYOUT_REGISTRY` entry; it never
   * inspects `content.type` to make that decision itself anymore (see
   * `theme-renderer.tsx`'s doc comment).
   */
  layout: LayoutResolution;
}
