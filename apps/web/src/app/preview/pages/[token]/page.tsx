import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { getPageForPreview } from '@/features/public/services/page-preview.service';
import { getActiveTheme } from '@/features/public/services/theme.service';
import { buildExtendedThemeCssVariables } from '@/features/public/theme-renderer/utils/theme-css-variables.util';
import { BlockRenderer } from '@/features/public/block-renderer/block-renderer';
import { parseBlocks } from '@/features/public/block-renderer/utils/parse-blocks.util';

interface RouteProps {
  params: Promise<{ token: string }>;
}

/**
 * `/preview/pages/[token]` — the admin Page Builder's Preview button
 * target (Milestone 7). Bare, same shape as `/preview/patterns/[id]`
 * (Milestone 6): no `PublicLayout`/site chrome, just theme CSS variables
 * + the real, unmodified `<BlockRenderer>`. Unlike the Pattern preview
 * route, this one is token-gated (`PagePreviewService`) rather than a
 * plain public-by-id route, since a Page can be DRAFT/REVIEW content — an
 * expired/invalid/guessed token resolves to `null` and 404s here exactly
 * like a missing page, never a distinguishable error.
 */
export default async function PagePreviewRoute({ params }: RouteProps) {
  const { token } = await params;
  const [page, theme] = await Promise.all([
    getPageForPreview(token),
    getActiveTheme().catch(() => null),
  ]);

  if (!page) {
    notFound();
  }

  const cssVariables = buildExtendedThemeCssVariables(theme);

  return (
    <div
      style={cssVariables as CSSProperties}
      className="container-page px-4 py-12 sm:px-6 lg:px-8"
    >
      <h1
        className="text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ color: 'var(--sportingspy-color-text)' }}
      >
        {page.title}
      </h1>
      <div
        className="mt-8 space-y-4"
        style={{ color: 'var(--sportingspy-color-text-secondary, var(--sportingspy-color-text))' }}
      >
        <BlockRenderer blocks={parseBlocks(page.body)} />
      </div>
    </div>
  );
}
