import type { CSSProperties } from 'react';
import type { RenderContext } from '../types/render-context.types';
import { PublicContentProvider } from '../providers/public-content-provider';
import { buildThemeCssVariables } from '../utils/css-variables.util';
import { ThemeRenderer } from '../theme-renderer/renderers/theme-renderer';

/**
 * PublicLayout — the shared wrapper every public page passes through. A
 * Server Component: `context` is already fully resolved by
 * `load-render-context.ts` before this renders, so nothing here fetches.
 *
 * As of Milestone 13.4, the pipeline is `Content → Theme → Renderer →
 * HTML`: this component now delegates to `ThemeRenderer`, which resolves
 * `theme.slug -> Theme Registry -> Layout -> Slots` and arranges
 * `ThemeHeader`/the real `PublicRenderer` output/`ThemeFooter` through
 * those slots — see `theme-renderer/renderers/theme-renderer.tsx`. This
 * file's own responsibilities are unchanged from Milestones 13.1/13.3:
 * compose `PublicContentProvider` and apply the base theme CSS variables
 * at this one outer element (kept exactly as before — `ThemeRenderer`'s
 * own layer applies the *extended* variable set one level further in,
 * additively, never replacing this).
 */
export function PublicLayout({ context }: { context: RenderContext }) {
  const cssVariables = buildThemeCssVariables(context.theme);

  return (
    <PublicContentProvider context={context}>
      <div style={cssVariables as CSSProperties} data-testid="public-layout">
        <ThemeRenderer context={context} />
      </div>
    </PublicContentProvider>
  );
}
