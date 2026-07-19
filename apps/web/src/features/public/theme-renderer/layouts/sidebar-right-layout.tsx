import { Slot } from '../slots/slot';
import { ThemeLayoutShell } from './layout-shell';
import type { ThemeLayoutProps } from './layout-types';

/** Mirrors `SidebarLeftLayout` — sidebar on the right instead. */
export function SidebarRightLayout({ slots, theme }: ThemeLayoutProps) {
  const hasSidebar = Boolean(slots.sidebar);

  return (
    <ThemeLayoutShell slots={slots} theme={theme}>
      <div className="container-page px-4 sm:px-6 lg:px-8">
        <div
          className={
            hasSidebar ? 'grid grid-cols-1 gap-8 lg:grid-cols-[1fr_16rem]' : 'grid grid-cols-1'
          }
        >
          <Slot name="content">{slots.content}</Slot>
          {hasSidebar ? <Slot name="sidebar">{slots.sidebar}</Slot> : null}
        </div>
      </div>
    </ThemeLayoutShell>
  );
}
