import { Slot } from '../slots/slot';
import { ThemeLayoutShell } from './layout-shell';
import type { ThemeLayoutProps } from './layout-types';

/** Content in a narrow, centered column (reading-width) — suited to
 * long-form article/page content rather than a wide grid. */
export function CenteredLayout({ slots, theme }: ThemeLayoutProps) {
  return (
    <ThemeLayoutShell slots={slots} theme={theme}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Slot name="content">{slots.content}</Slot>
      </div>
    </ThemeLayoutShell>
  );
}
