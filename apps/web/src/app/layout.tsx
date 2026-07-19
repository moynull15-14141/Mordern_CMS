import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getCurrentSite } from '@/features/public/services/site.service';
import { getPublicSettings } from '@/features/public/services/settings.service';
import { getActiveTheme } from '@/features/public/services/theme.service';
import { findSettingValue } from '@/features/public/utils/settings-lookup.util';
import { DEFAULT_LOCALE } from '@/features/public/constants/rendering.constants';
import '../styles/globals.css';

/**
 * Root layout — Next.js's own file-routing shell (`<html>`/`<body>`), a
 * different concern from the custom `PublicLayout` component every route
 * renders inside of (provider composition + the Renderer pipeline). Both
 * coexist: this file owns document-level metadata (`<html lang>`,
 * `<title>` template, favicon); `PublicLayout` owns per-request theme/nav
 * data.
 *
 * `getCurrentSite`/`getPublicSettings`/`getActiveTheme` are each wrapped in
 * React's `cache()` at their definition (see those files) — calling them
 * here AND again inside each route's `loadRenderContext()` call dedupes to
 * one request per function per render, never two.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [site, settings, theme] = await Promise.all([
    getCurrentSite().catch(() => null),
    getPublicSettings().catch(() => null),
    getActiveTheme().catch(() => null),
  ]);

  const siteName =
    findSettingValue<string>(settings, 'general.siteName') ?? site?.name ?? 'SportingSpy';
  const tagline = findSettingValue<string>(settings, 'general.siteTagline');

  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: tagline || undefined,
    icons: theme?.favicon ? { icon: theme.favicon } : undefined,
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const site = await getCurrentSite().catch(() => null);

  return (
    <html lang={site?.locale ?? DEFAULT_LOCALE}>
      <body>{children}</body>
    </html>
  );
}
