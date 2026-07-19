import type { PublicNavigationMenus } from '../../types/render-context.types';
import type { PublicTheme } from '../../types/theme.types';
import type { PublicSetting } from '../../types/settings.types';
import { findSettingValue } from '../../utils/settings-lookup.util';
import { NavMenu } from '../../components/nav-menu';
import { resolveChromePosition } from '../utils/resolve-chrome-position.util';

/** Themed site footer — see `theme-header.tsx`'s doc comment for the same
 * "reuses NavMenu, supersedes 13.3's Footer, positioning from
 * `theme.layout.footer`" reasoning ("Footer Fixed" in the brief). */
export function ThemeFooter({
  menus,
  theme,
  settings,
}: {
  menus: PublicNavigationMenus;
  theme: PublicTheme | null;
  settings: PublicSetting[] | null;
}) {
  const siteName = findSettingValue<string>(settings, 'general.siteName');
  const tagline = findSettingValue<string>(settings, 'general.siteTagline');
  const footerItems = menus.footer?.items ?? [];
  const year = new Date().getFullYear();
  const position = resolveChromePosition(theme?.layout.footer ?? null);

  return (
    <footer
      className={`border-t border-[var(--sportingspy-color-border)] bg-[var(--sportingspy-color-surface)] ${position === 'sticky' ? 'sticky bottom-0' : ''}`}
    >
      <div className="container-page flex flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {siteName ? (
              <p className="text-base font-semibold text-[var(--sportingspy-color-text)]">
                {siteName}
              </p>
            ) : null}
            {tagline ? (
              <p className="mt-1 text-sm text-[var(--sportingspy-color-muted)]">{tagline}</p>
            ) : null}
          </div>
          <NavMenu items={footerItems} orientation="vertical" className="sm:flex-row sm:gap-6" />
        </div>
        {siteName ? (
          <p className="border-t border-[var(--sportingspy-color-border)] pt-6 text-xs text-[var(--sportingspy-color-muted)]">
            © {year} {siteName}. All rights reserved.
          </p>
        ) : null}
      </div>
    </footer>
  );
}
