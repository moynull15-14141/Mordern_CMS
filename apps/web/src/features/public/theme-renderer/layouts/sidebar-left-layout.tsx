import { Slot } from '../slots/slot';
import { ThemeLayoutShell } from './layout-shell';
import type { ThemeLayoutProps } from './layout-types';

/**
 * Two-column grid, sidebar on the left — collapses to a single stacked
 * column below the `lg` breakpoint (Responsive: "Desktop / Tablet /
 * Mobile", no duplicated render logic — one JSX tree, CSS handles every
 * breakpoint). If no `sidebar` slot content is supplied, the grid still
 * renders as a single column (`grid-cols-1`) — no empty gap.
 */
export function SidebarLeftLayout({ slots, theme }: ThemeLayoutProps) {
  const hasSidebar = Boolean(slots.sidebar);

  return (
    <ThemeLayoutShell slots={slots} theme={theme}>
      <div className="container-page px-4 sm:px-6 lg:px-8">
        <div
          className={
            hasSidebar ? 'grid grid-cols-1 gap-8 lg:grid-cols-[16rem_1fr]' : 'grid grid-cols-1'
          }
        >
          {hasSidebar ? <Slot name="sidebar">{slots.sidebar}</Slot> : null}
          <Slot name="content">{slots.content}</Slot>
        </div>
      </div>
    </ThemeLayoutShell>
  );
}
