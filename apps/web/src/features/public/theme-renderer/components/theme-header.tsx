import Link from 'next/link';
import type { PublicNavigationMenus } from '../../types/render-context.types';
import type { PublicTheme } from '../../types/theme.types';
import type { PublicSetting } from '../../types/settings.types';
import { findSettingValue } from '../../utils/settings-lookup.util';
import { NavMenu } from '../../components/nav-menu';
import { resolveChromePosition } from '../utils/resolve-chrome-position.util';

/**
 * Themed site header — the `ThemeRenderer`'s `header` slot content.
 * Reuses `NavMenu` (13.3, unchanged — the recursive, unlimited-depth,
 * CSS-only-dropdown nav) for the actual menu tree; owns only the chrome
 * around it. Positioning (`static`/`sticky`) comes from the real, open-ended
 * `theme.layout.header` field via `resolveChromePosition` — "Header
 * Fixed" in the milestone brief.
 *
 * A Server Component — same "props not hooks" reasoning as 13.3's
 * `Header`, which this supersedes for the live pipeline (kept, untouched,
 * for backward compatibility — see docs/77_THEME_RENDERING_SYSTEM.md
 * "Remaining Limitations").
 */
export function ThemeHeader({
  menus,
  theme,
  settings,
}: {
  menus: PublicNavigationMenus;
  theme: PublicTheme | null;
  settings: PublicSetting[] | null;
}) {
  const siteName = findSettingValue<string>(settings, 'general.siteName') ?? theme?.name ?? 'Home';
  const headerItems = menus.header?.items ?? [];
  const position = resolveChromePosition(theme?.layout.header ?? null);

  return (
    <header
      className={`z-40 border-b border-[var(--sportingspy-color-border)] bg-[var(--sportingspy-color-background)] ${position === 'sticky' ? 'sticky top-0' : ''}`}
    >
      <div className="container-page flex items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-[var(--sportingspy-color-text)]"
        >
          {theme?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote, theme-supplied logo URL; no static import target exists.
            <img src={theme.logo} alt={siteName} className="h-8 w-auto" />
          ) : (
            <span>{siteName}</span>
          )}
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <NavMenu items={headerItems} />
        </nav>

        <details className="lg:hidden">
          <summary className="cursor-pointer list-none rounded-[var(--sportingspy-radius,0.5rem)] border border-[var(--sportingspy-color-border)] px-3 py-1.5 text-sm font-medium text-[var(--sportingspy-color-text)]">
            Menu
          </summary>
          <nav
            aria-label="Primary"
            className="absolute inset-x-0 z-30 border-b border-[var(--sportingspy-color-border)] bg-[var(--sportingspy-color-background)] px-4 py-4 shadow-lg"
          >
            <NavMenu items={headerItems} orientation="vertical" />
          </nav>
        </details>
      </div>
    </header>
  );
}
