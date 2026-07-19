import { Slot } from '../slots/slot';
import { ThemeLayoutShell } from './layout-shell';
import type { ThemeLayoutProps } from './layout-types';

/** Content sits inside a bordered, rounded "card" within the standard
 * container width — a boxed, contained feel rather than content bleeding
 * into the page background. */
export function BoxedLayout({ slots, theme }: ThemeLayoutProps) {
  return (
    <ThemeLayoutShell slots={slots} theme={theme}>
      <div className="container-page px-4 sm:px-6 lg:px-8">
        <div className="rounded-[var(--sportingspy-radius,0.5rem)] border border-[var(--sportingspy-color-border)] bg-[var(--sportingspy-color-surface)] p-6 shadow-sm sm:p-10">
          <Slot name="content">{slots.content}</Slot>
        </div>
      </div>
    </ThemeLayoutShell>
  );
}
