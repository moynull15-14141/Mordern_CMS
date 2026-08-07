import type { CSSProperties, ReactNode } from 'react';
import { Slot } from '../slots/slot';
import type { ThemeSlots } from '../slots/types';
import type { PublicTheme } from '../../types/theme.types';
import { buildExtendedThemeCssVariables } from '../utils/theme-css-variables.util';

/**
 * The chrome every layout preset shares: header, primary navigation,
 * hero, footer CTA, and footer — identical across all 7 presets, only the
 * *content area* (between hero and footer CTA) differs, which is why each
 * preset component provides `children` instead of repeating this
 * boilerplate. Not itself a registered preset (`layout-registry.ts` never
 * points at this file) — a shared internal building block.
 *
 * Applies the extended, theme-derived CSS variables
 * (`--sportingspy-color-accent`/`--sportingspy-radius`/
 * `--sportingspy-font-family`, on top of the base set `PublicLayout`
 * already applies one level up — see `theme-css-variables.util.ts`'s doc
 * comment) once here, so every Theme* component underneath any preset can
 * read them without recomputing anything.
 *
 * Also paints `background` explicitly on this same element (Milestone 8
 * bugfix). `globals.css`'s `body { background: var(--sportingspy-page-background,
 * var(--sportingspy-color-background)) }` rule can only ever see the
 * *static* `:root` default for that variable — a CSS custom property
 * declared on this `<div>` (via the `style` object below) is scoped to
 * this element and its descendants, never visible on `<body>`, an
 * *ancestor* of this div. Before Milestone 8 that was invisible (the
 * variable had no dynamic value to lose either way); now that Design
 * Tokens give it a real per-theme value, `<body>` silently kept showing
 * the static default while everything *inside* this shell (header,
 * footer, content) correctly updated — exactly the "navbar changed, page
 * behind it didn't" bug. Painting it here, where the variable is
 * actually in scope, fixes it without touching the `<body>` rule (which
 * stays as a harmless min-flash-of-unstyled-background fallback for the
 * sliver of viewport this `min-h-screen` div doesn't always cover).
 */
export function ThemeLayoutShell({
  slots,
  theme,
  children,
}: {
  slots: ThemeSlots;
  theme: PublicTheme | null;
  children: ReactNode;
}) {
  const cssVariables = buildExtendedThemeCssVariables(theme);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={
        {
          ...cssVariables,
          background: 'var(--sportingspy-page-background, var(--sportingspy-color-background))',
        } as CSSProperties
      }
      data-testid="theme-layout-shell"
    >
      <Slot name="header">{slots.header}</Slot>
      <Slot name="primaryNavigation">{slots.primaryNavigation}</Slot>
      <Slot name="hero">{slots.hero}</Slot>
      <main className="flex-1">
        <Slot name="beforeContent">{slots.beforeContent}</Slot>
        {children}
        <Slot name="afterContent">{slots.afterContent}</Slot>
      </main>
      <Slot name="footerCta">{slots.footerCta}</Slot>
      <Slot name="footer">{slots.footer}</Slot>
    </div>
  );
}
