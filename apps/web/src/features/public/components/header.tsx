import Link from 'next/link';
import type { PublicNavigationMenus } from '../types/render-context.types';
import type { PublicTheme } from '../types/theme.types';
import type { PublicSetting } from '../types/settings.types';
import { findSettingValue } from '../utils/settings-lookup.util';
import { NavMenu } from './nav-menu';

/**
 * Site header — a Server Component. Receives `menus`/`theme`/`settings`
 * directly as props (from `RenderContext`, resolved once by
 * `load-render-context.ts`) rather than via `useNavigation()`/`useTheme()`
 * — no client boundary is needed just to read data `PublicLayout` (a
 * Server Component) already has (Performance: "Server Components first").
 *
 * The mobile menu uses a native `<details>`/`<summary>` disclosure —
 * keyboard-accessible and requires no client JavaScript at all.
 */
export function Header({
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

  return (
    <header className="border-b border-gray-200">
      <div className="container-page flex items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
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
          <summary className="cursor-pointer list-none rounded-[var(--sportingspy-border-radius)] border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700">
            Menu
          </summary>
          <nav
            aria-label="Primary"
            className="absolute inset-x-0 z-30 border-b border-gray-200 bg-white px-4 py-4 shadow-lg"
          >
            <NavMenu items={headerItems} orientation="vertical" />
          </nav>
        </details>
      </div>
    </header>
  );
}
