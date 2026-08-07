import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { getPattern } from '@/features/public/services/patterns.service';
import { getActiveTheme } from '@/features/public/services/theme.service';
import { buildExtendedThemeCssVariables } from '@/features/public/theme-renderer/utils/theme-css-variables.util';
import { BlockRenderer } from '@/features/public/block-renderer/block-renderer';
import { parseBlocks } from '@/features/public/block-renderer/utils/parse-blocks.util';

interface RouteProps {
  params: Promise<{ id: string }>;
}

/**
 * `/preview/patterns/[id]` — the admin Pattern Detail page's preview
 * iframe target (Milestone 6 spec: "Use the existing Block Renderer. Do
 * NOT create a separate preview renderer."). Deliberately bare: no
 * `PublicLayout`/`PublicContentProvider` (that machinery resolves a whole
 * page's site/menus/layout, none of which a single pattern preview needs
 * — the block-renderer components here read no context, only props), just
 * the same theme CSS variables applied so the pattern renders with real
 * colors/spacing, then `<BlockRenderer>` unchanged. Desktop/Tablet/Mobile
 * width toggles live in the admin iframe wrapper, not here — this route
 * always renders at its natural width.
 */
export default async function PatternPreviewRoute({ params }: RouteProps) {
  const { id } = await params;
  const [pattern, theme] = await Promise.all([getPattern(id), getActiveTheme().catch(() => null)]);

  if (!pattern) {
    notFound();
  }

  const cssVariables = buildExtendedThemeCssVariables(theme);

  return (
    <div style={cssVariables as CSSProperties}>
      <BlockRenderer blocks={parseBlocks(pattern.body)} />
    </div>
  );
}
