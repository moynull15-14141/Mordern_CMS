'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { LayoutResolution } from './types';

/**
 * LayoutContext / LayoutProvider / useLayout (Milestone 14.1) — mirrors
 * `ThemeContext`/`ThemeProvider`/`useTheme()`'s exact shape: data only, no
 * UI. The resolution is computed once, server-side, by `resolveLayout()`
 * (`resolve-layout.ts`) as part of `loadRenderContext`, and passed in as a
 * prop here — this component never fetches. `ThemeRenderer` itself is a
 * Server Component and reads `context.layout` directly (no need for this
 * hook); `LayoutProvider` exists for a future *client* component (e.g. a
 * Visual Builder layout-preview control) that needs the resolved layout
 * reactively rather than via prop-drilling — the same reasoning
 * `theme-renderer/hooks/use-layout-preset.ts` already documents for its
 * own, narrower `useLayoutPreset()`.
 */
export const LayoutContext = createContext<LayoutResolution | undefined>(undefined);

export function LayoutProvider({
  resolution,
  children,
}: {
  resolution: LayoutResolution;
  children: ReactNode;
}) {
  return <LayoutContext.Provider value={resolution}>{children}</LayoutContext.Provider>;
}

export function useLayout(): LayoutResolution {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout() must be used within a <LayoutProvider>.');
  }
  return context;
}
