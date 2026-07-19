import { Slot } from '../slots/slot';
import { ThemeLayoutShell } from './layout-shell';
import type { ThemeLayoutProps } from './layout-types';

/** Functionally identical to `DefaultLayout` — a distinct, explicit name
 * for when an admin wants to affirmatively say "no sidebar" rather than
 * relying on the fallback preset. Kept as a separate registry entry/file
 * (not an alias) so the two can diverge later without a breaking rename. */
export function NoSidebarLayout({ slots, theme }: ThemeLayoutProps) {
  return (
    <ThemeLayoutShell slots={slots} theme={theme}>
      <div className="container-page px-4 sm:px-6 lg:px-8">
        <Slot name="content">{slots.content}</Slot>
      </div>
    </ThemeLayoutShell>
  );
}
