import type { PublicNavigationMenus } from '../types/render-context.types';
import type { PublicSetting } from '../types/settings.types';
import { findSettingValue } from '../utils/settings-lookup.util';
import { NavMenu } from './nav-menu';

/** Site footer — a Server Component, same "props not hooks" reasoning as
 * `Header`. */
export function Footer({
  menus,
  settings,
}: {
  menus: PublicNavigationMenus;
  settings: PublicSetting[] | null;
}) {
  const siteName = findSettingValue<string>(settings, 'general.siteName');
  const tagline = findSettingValue<string>(settings, 'general.siteTagline');
  const footerItems = menus.footer?.items ?? [];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container-page flex flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {siteName ? <p className="text-base font-semibold text-gray-900">{siteName}</p> : null}
            {tagline ? <p className="mt-1 text-sm text-gray-600">{tagline}</p> : null}
          </div>
          <NavMenu items={footerItems} orientation="vertical" className="sm:flex-row sm:gap-6" />
        </div>
        {siteName ? (
          <p className="border-t border-gray-200 pt-6 text-xs text-gray-500">
            © {year} {siteName}. All rights reserved.
          </p>
        ) : null}
      </div>
    </footer>
  );
}
