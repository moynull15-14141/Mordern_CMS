import type { BlockComponentProps } from '../types/block.types';

/**
 * `dangerouslySetInnerHTML` is safe here because the value was already
 * run through an allow-list HTML sanitizer at write time — see
 * `apps/backend/src/modules/content-blocks/sanitization/block-tree-sanitizer.service.ts`,
 * called from `ArticlesService`/`PagesService`/`ReusableBlocksService`
 * before every create/update. This is defense-at-the-source, not
 * defense-at-render: nothing sanitizes again here, by design (sanitizing
 * twice risks double-unescaping, a real XSS vector of its own). The only
 * other `dangerouslySetInnerHTML` in this app is `json-ld.tsx`, which
 * injects backend-controlled JSON, not editor-authored markup.
 */
export function HtmlBlock({ block }: BlockComponentProps) {
  const html = typeof block.data.html === 'string' ? block.data.html : '';
  if (!html) return null;

  return (
    <div className="my-2" data-testid="html-block" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
