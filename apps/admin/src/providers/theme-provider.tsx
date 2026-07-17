'use client';

import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { THEMES } from '@/constants/theme';

/** Light / Dark / System, persisted — docs/57_DESIGN_SYSTEM.md "Theme". */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={THEMES.SYSTEM}
      enableSystem
      storageKey={STORAGE_KEYS.THEME}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
