'use client';

import { useTheme } from '../../hooks/use-theme';
import { resolveLayoutPreset } from '../utils/resolve-layout-preset.util';
import type { LayoutContentArea } from '../utils/layout-preset.types';
import type { LayoutPresetName } from '../utils/layout-preset.types';

/**
 * Client-side access to "which layout preset is currently active" —
 * `ThemeRenderer` itself is a Server Component and never needs this (it
 * calls `resolveLayoutPreset` directly), but a future *client* component
 * (e.g. a live layout-switcher preview in a Visual Builder — see
 * docs/77_THEME_RENDERING_SYSTEM.md "Future Visual Builder Integration")
 * would need to read the resolved preset reactively rather than via
 * prop-drilling. Built on `useTheme()` (13.1, unchanged).
 */
export function useLayoutPreset(area: LayoutContentArea): LayoutPresetName {
  const { theme } = useTheme();
  return resolveLayoutPreset(theme, area);
}
