import type { ComponentType } from 'react';
import type { ThemeSlots } from '../slots/types';
import type { PublicTheme } from '../../types/theme.types';

export interface ThemeLayoutProps {
  slots: ThemeSlots;
  /** Passed through so `ThemeLayoutShell` can apply the extended,
   * theme-derived CSS variables (`theme-css-variables.util.ts`) at the
   * one wrapper element every preset shares — never read for branching
   * logic inside a specific layout (that would make Layout "contain
   * business logic," which the milestone brief forbids). */
  theme: PublicTheme | null;
}

export type ThemeLayoutComponent = ComponentType<ThemeLayoutProps>;
