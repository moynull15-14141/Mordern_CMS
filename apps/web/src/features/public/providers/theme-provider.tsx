'use client';

import { createContext, useMemo, type ReactNode } from 'react';
import type { PublicTheme } from '../types/theme.types';
import { buildThemeCssVariables } from '../utils/css-variables.util';

export interface ThemeContextValue {
  theme: PublicTheme | null;
  cssVariables: Record<string, string>;
}

/**
 * ThemeProvider — data only, no UI (milestone brief). Data comes from
 * `theme.service.ts`'s `getActiveTheme()`, resolved server-side by the
 * caller (`PublicContentProvider`/`PublicLayout`) and passed in as a prop
 * — this component itself never fetches, keeping the client bundle free
 * of fetch/env logic (milestone brief: "Server Components first").
 */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  theme,
  children,
}: {
  theme: PublicTheme | null;
  children: ReactNode;
}) {
  const value = useMemo<ThemeContextValue>(
    () => ({ theme, cssVariables: buildThemeCssVariables(theme) }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
