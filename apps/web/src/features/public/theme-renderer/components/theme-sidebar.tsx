import type { ReactNode } from 'react';
import { ThemeEmptyState } from './theme-empty-state';

/**
 * Wraps whatever content a caller supplies to the `sidebar` slot
 * (`sidebar-left`/`sidebar-right` layouts). No content type currently
 * supplies any (no backend-driven "widget" concept exists — see
 * docs/77_THEME_RENDERING_SYSTEM.md "Remaining Limitations") — `children`
 * is optional so this can be dropped into a layout ahead of a real caller
 * existing, falling back to a plain empty-state note instead of an
 * awkward blank column.
 */
export function ThemeSidebar({ children }: { children?: ReactNode }) {
  return (
    <aside aria-label="Sidebar" className="flex flex-col gap-6">
      {children ?? <ThemeEmptyState message="Nothing to show here yet." />}
    </aside>
  );
}
