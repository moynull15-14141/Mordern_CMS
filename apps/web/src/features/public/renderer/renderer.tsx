import { createElement } from 'react';
import type { RenderContext } from '../types/render-context.types';
import { getRendererFor } from './renderer-registry';
import { NotFoundRenderer } from './not-found-renderer';

/**
 * PublicRenderer — "Input: RenderContext. Output: React nodes." (milestone
 * brief). A Server Component: it does no fetching itself (everything it
 * needs already lives on `context`, assembled by
 * `load-render-context.ts`), so it stays on the server by default.
 *
 * Looks up `context.content.type` in `RENDERER_REGISTRY` and passes the
 * *whole* `context` through (not just `content`) — `HomeRenderer` needs
 * `context.settings` for site branding, which a narrower `{ content }`
 * prop couldn't supply; every other renderer simply ignores the fields it
 * doesn't need. Every content type this app resolves to
 * (page/article/category/home/blog-list/not-found) is registered, so the
 * "no registered renderer" branch below is a defensive fallback, not a
 * reachable path today.
 */
export function PublicRenderer({ context }: { context: RenderContext }) {
  const registeredRenderer = getRendererFor(context.content);

  if (!registeredRenderer) {
    return <NotFoundRenderer context={context} />;
  }

  // `createElement` (not a JSX tag) deliberately — the component reference
  // comes from a registry lookup, not from defining a new component during
  // render; the registry's stable module-level references
  // (`PageRenderer`/`ArticleRenderer`/...) never change identity between
  // renders.
  return createElement(registeredRenderer, { context });
}
