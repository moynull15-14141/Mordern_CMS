'use client';

import { createContext, useMemo, type ReactNode } from 'react';
import type { PublicNavigationMenus } from '../types/render-context.types';

/**
 * NavigationProvider — data only, no rendering (milestone brief). Data
 * comes from `navigation.service.ts`'s `getMenuByLocation()`, resolved
 * server-side and passed in as a prop — see `ThemeProvider`'s doc comment
 * for why this component never fetches itself.
 */
export const NavigationContext = createContext<PublicNavigationMenus | undefined>(undefined);

export function NavigationProvider({
  menus,
  children,
}: {
  menus: PublicNavigationMenus;
  children: ReactNode;
}) {
  const value = useMemo<PublicNavigationMenus>(() => menus, [menus]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
