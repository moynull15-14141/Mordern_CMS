import { Slot } from '../slots/slot';
import { ThemeLayoutShell } from './layout-shell';
import type { ThemeLayoutProps } from './layout-types';

/** The fallback preset — single column, standard `container-page` width.
 * Used whenever `theme.layout.homepage`/`.blog` is unset or an
 * unrecognized string, and always for `Page`/`Category`/`not-found` (no
 * dedicated theme field exists for those — see
 * `resolve-layout-preset.util.ts`). `sidebar` is intentionally not
 * rendered even if supplied — a content type that needs a sidebar should
 * resolve to `sidebar-left`/`sidebar-right` instead. */
export function DefaultLayout({ slots, theme }: ThemeLayoutProps) {
  return (
    <ThemeLayoutShell slots={slots} theme={theme}>
      <div className="container-page px-4 sm:px-6 lg:px-8">
        <Slot name="content">{slots.content}</Slot>
      </div>
    </ThemeLayoutShell>
  );
}
