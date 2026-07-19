'use client';

import { createContext, useMemo, type ReactNode } from 'react';
import type { RenderContext } from '../types/render-context.types';
import { ThemeProvider } from './theme-provider';
import { NavigationProvider } from './navigation-provider';
import { LayoutProvider } from '../layout-engine/layout-context';

export type PublicContentContextValue = Pick<
  RenderContext,
  'site' | 'settings' | 'locale' | 'seo' | 'content'
>;

/**
 * PublicContentProvider — the outer data provider (milestone brief:
 * "load current site, load active theme, load public settings, cache
 * requests, provide context. No rendering logic. Only data."). It
 * receives an already-assembled `RenderContext` (built server-side by
 * `renderer/load-render-context.ts` via the real `theme`/`navigation`
 * services — see those files for what "cache requests" means here) and:
 *
 * 1. Composes `ThemeProvider`/`NavigationProvider`/`LayoutProvider`
 *    (Milestone 14.1) underneath so a page only ever mounts one provider
 *    tree, never several.
 * 2. Exposes the remaining slices (`site`, `settings`, `locale`, `seo`,
 *    `content`) through its own context.
 *
 * No fetch call lives in this component itself — every page under it
 * reads theme/menus/site/settings/content through hooks
 * (`features/public/hooks`), never by fetching directly (Architecture
 * Requirements: "No page should know where theme/menus/settings come
 * from").
 */
export const PublicContentContext = createContext<PublicContentContextValue | undefined>(undefined);

export function PublicContentProvider({
  context,
  children,
}: {
  context: RenderContext;
  children: ReactNode;
}) {
  const { theme, menus, site, settings, locale, seo, content, layout } = context;

  const value = useMemo<PublicContentContextValue>(
    () => ({ site, settings, locale, seo, content }),
    [site, settings, locale, seo, content]
  );

  return (
    <PublicContentContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <NavigationProvider menus={menus}>
          <LayoutProvider resolution={layout}>{children}</LayoutProvider>
        </NavigationProvider>
      </ThemeProvider>
    </PublicContentContext.Provider>
  );
}
