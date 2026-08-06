import type { BlockNode } from '../types/block.types';

/**
 * `Article.body`/`Page.body` are exposed publicly as opaque `unknown`
 * (`PublicArticleResponseDto.body`/`PublicPageResponseDto.body` — see
 * those DTOs' doc comments; the backend deliberately does not narrow this
 * type). This is the one place that trusts the shape — everywhere else in
 * `block-renderer/` works with a real `BlockNode[]`. A body that isn't a
 * `{blocks: [...]}` object (never happens for content written through the
 * admin block editor, but is the honest shape for content stored before
 * this milestone, or any other malformed value) degrades to an empty
 * array — "render nothing" — rather than throwing and breaking the whole
 * page, matching this codebase's established "a missing/malformed
 * optional value is a legitimate state" convention.
 */
export function parseBlocks(body: unknown): BlockNode[] {
  if (
    typeof body === 'object' &&
    body !== null &&
    'blocks' in body &&
    Array.isArray((body as { blocks: unknown }).blocks)
  ) {
    return (body as { blocks: unknown[] }).blocks as BlockNode[];
  }
  return [];
}
