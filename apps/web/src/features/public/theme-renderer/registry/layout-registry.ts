import type { LayoutPresetName } from '../utils/layout-preset.types';
import type { ThemeLayoutComponent } from '../layouts/layout-types';
import { DefaultLayout } from '../layouts/default-layout';
import { FullWidthLayout } from '../layouts/full-width-layout';
import { BoxedLayout } from '../layouts/boxed-layout';
import { CenteredLayout } from '../layouts/centered-layout';
import { SidebarLeftLayout } from '../layouts/sidebar-left-layout';
import { SidebarRightLayout } from '../layouts/sidebar-right-layout';
import { NoSidebarLayout } from '../layouts/no-sidebar-layout';

/**
 * `LayoutPresetName -> Layout component` — "No switch statements across
 * the app" (milestone brief). `ThemeRenderer` is the only place this map
 * is read; adding an 8th preset later means one new registry entry, never
 * a new `if`/`switch` at a call site.
 */
export const LAYOUT_REGISTRY: Record<LayoutPresetName, ThemeLayoutComponent> = {
  default: DefaultLayout,
  'full-width': FullWidthLayout,
  boxed: BoxedLayout,
  centered: CenteredLayout,
  'sidebar-left': SidebarLeftLayout,
  'sidebar-right': SidebarRightLayout,
  'no-sidebar': NoSidebarLayout,
};

export function getLayoutComponent(preset: LayoutPresetName): ThemeLayoutComponent {
  return LAYOUT_REGISTRY[preset];
}
