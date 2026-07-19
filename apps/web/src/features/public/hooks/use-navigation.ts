'use client';

import { useContext } from 'react';
import { NavigationContext } from '../providers/navigation-provider';
import type { PublicNavigationMenus } from '../types/render-context.types';

export function useNavigation(): PublicNavigationMenus {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      'useNavigation() must be used within a <NavigationProvider> (or <PublicContentProvider>).'
    );
  }
  return context;
}
