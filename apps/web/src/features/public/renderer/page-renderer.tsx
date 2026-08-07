import type { RenderContext } from '../types/render-context.types';
import type { PublicPageContent } from '../types/content.types';
import { BlockRenderer } from '../block-renderer/block-renderer';
import { parseBlocks } from '../block-renderer/utils/parse-blocks.util';

/**
 * Renders a resolved `Page`. `body` renders through the Rich Content
 * Engine's `BlockRenderer` (Phase 1 / Step 1) — see
 * `block-renderer/block-renderer.tsx`.
 */
export function PageRenderer({ context }: { context: RenderContext }) {
  const content = context.content as PublicPageContent;
  return (
    <article data-testid="page-renderer" className="container-page px-4 py-12 sm:px-6 lg:px-8">
      <h1
        className="text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ color: 'var(--sportingspy-color-text)' }}
      >
        {content.title}
      </h1>
      {content.seo?.description ? (
        <p className="mt-4 text-lg" style={{ color: 'var(--sportingspy-color-muted)' }}>
          {content.seo.description}
        </p>
      ) : null}
      <div
        className="mt-8 space-y-4"
        style={{ color: 'var(--sportingspy-color-text-secondary, var(--sportingspy-color-text))' }}
      >
        <BlockRenderer blocks={parseBlocks(content.body)} />
      </div>
    </article>
  );
}
