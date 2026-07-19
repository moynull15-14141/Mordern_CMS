import type { ResolvedPublicContent } from '../types/content.types';
import type { PublicTheme } from '../types/theme.types';
import { resolveContentArea } from '../theme-renderer/renderers/resolve-content-area.util';
import { resolveLayoutPreset } from '../theme-renderer/utils/resolve-layout-preset.util';
import { isKnownLayoutPresetName } from '../theme-renderer/utils/layout-preset.types';
import { getLayoutResolution } from './services/layout-resolve.service';
import type { LayoutResolution } from './types';
import type { PublicLayoutContentType } from './types';

/**
 * Maps `ResolvedPublicContent`'s type/slug onto the public Layout API's own
 * `(contentType, slug)` vocabulary — `null` means "no per-instance target
 * exists to look up an explicit/content-default assignment for", in which
 * case `resolveLayout` below skips the network call entirely rather than
 * inventing a mapping:
 * - `home` -> `{ contentType: 'home' }` (no slug — one homepage per site)
 * - `page`/`article`/`category` -> their own real `slug`
 * - `blog-list` -> `null`. The backend's `LayoutAssignmentContentType` enum
 *   (`HOMEPAGE`/`PAGE`/`ARTICLE`/`CATEGORY`) has no "blog listing" member —
 *   the `/blog` route isn't one addressable entity, it's a query over
 *   Articles. Inventing a fifth enum value/content type here would violate
 *   Rule Zero; `/blog` instead falls through to the theme-default/
 *   system-default tiers directly (`theme.layout.blog`), exactly as it did
 *   before this milestone (Milestone 13.4).
 * - `not-found` -> `null`, same reasoning — no entity, no theme field
 *   either (`resolveContentArea('not-found')` is already `'default'`).
 */
function toPublicLayoutQuery(
  content: ResolvedPublicContent
): { contentType: PublicLayoutContentType; slug?: string } | null {
  switch (content.type) {
    case 'home':
      return { contentType: 'home' };
    case 'page':
      return { contentType: 'page', slug: content.slug };
    case 'article':
      return { contentType: 'article', slug: content.slug };
    case 'category':
      return { contentType: 'category', slug: content.slug };
    case 'blog-list':
    case 'not-found':
      return null;
    default: {
      const exhaustiveCheck: never = content;
      return exhaustiveCheck;
    }
  }
}

/**
 * `LayoutResolver` (Milestone 14.1) — decides which layout preset a route
 * renders with, in the exact priority order the milestone brief specifies:
 *
 * 1. **Explicit assignment** — a `LayoutAssignment` tied to this specific
 *    Page/Article/Category (or the one Homepage assignment).
 * 2. **Content default** — a `LayoutAssignment` tied to this whole content
 *    type, site-wide (no entity FK — see the backend's own
 *    `LayoutAssignment` doc comment).
 * 3. **Theme default** — the real, open-ended `theme.layout.homepage`/
 *    `.blog` field (`resolveLayoutPreset`, Milestone 13.4, unchanged).
 * 4. **System default** — `'default'`, `resolveLayoutPreset`'s own final
 *    fallback.
 *
 * Tiers 1–2 come from the real `GET /public/layouts/resolve` endpoint
 * (skipped entirely for `blog-list`/`not-found` — see
 * `toPublicLayoutQuery`'s doc comment); tiers 3–4 are already fully
 * implemented by 13.4's `resolveLayoutPreset`, reused here unchanged. A
 * backend-provided preset this app doesn't have a registered component for
 * (`isKnownLayoutPresetName`) is treated as "this tier had nothing",
 * falling through to the next one — never a crash, never a guess.
 */
export async function resolveLayout(
  content: ResolvedPublicContent,
  theme: PublicTheme | null
): Promise<LayoutResolution> {
  const area = resolveContentArea(content.type);
  const query = toPublicLayoutQuery(content);

  if (query) {
    const resolution = await getLayoutResolution(query.contentType, query.slug);

    if (isKnownLayoutPresetName(resolution.explicitLayoutPreset)) {
      return { preset: resolution.explicitLayoutPreset, source: 'explicit' };
    }
    if (isKnownLayoutPresetName(resolution.contentDefaultLayoutPreset)) {
      return { preset: resolution.contentDefaultLayoutPreset, source: 'content-default' };
    }
  }

  const themeFieldValue = theme
    ? area === 'home'
      ? theme.layout.homepage
      : area === 'blog'
        ? theme.layout.blog
        : null
    : null;

  return {
    preset: resolveLayoutPreset(theme, area),
    source: isKnownLayoutPresetName(themeFieldValue) ? 'theme-default' : 'system-default',
  };
}
