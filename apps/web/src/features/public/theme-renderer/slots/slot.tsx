import type { ReactNode } from 'react';
import type { SlotName } from './slot-names';

/**
 * Renders one named slot's content, or nothing if empty. Every `Layout`
 * component renders its regions through `<Slot>` instead of inlining the
 * caller's JSX directly (milestone brief: "Every renderer should render
 * through slots instead of hardcoding JSX") — this is the one place that
 * decides "empty slot → render nothing," so no layout has to repeat that
 * `null` check itself.
 *
 * `data-slot` is a stable, testable/stylable hook (e.g. a future theme
 * could target `[data-slot="hero"]` in custom CSS) — not used for any
 * logic here.
 */
export function Slot({ name, children }: { name: SlotName; children?: ReactNode }) {
  if (children === undefined || children === null) return null;
  return <div data-slot={name}>{children}</div>;
}
