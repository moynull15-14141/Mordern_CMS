'use client';

import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '../providers/theme-provider';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useTheme() must be used within a <ThemeProvider> (or <PublicContentProvider>).'
    );
  }
  return context;
}
