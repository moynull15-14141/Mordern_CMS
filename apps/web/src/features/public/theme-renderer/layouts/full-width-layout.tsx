import { Slot } from '../slots/slot';
import { ThemeLayoutShell } from './layout-shell';
import type { ThemeLayoutProps } from './layout-types';

/** Content spans the full viewport width — no `container-page` max-width
 * constraint. Useful for a homepage that wants edge-to-edge sections. */
export function FullWidthLayout({ slots, theme }: ThemeLayoutProps) {
  return (
    <ThemeLayoutShell slots={slots} theme={theme}>
      <div className="px-4 sm:px-6 lg:px-8">
        <Slot name="content">{slots.content}</Slot>
      </div>
    </ThemeLayoutShell>
  );
}
