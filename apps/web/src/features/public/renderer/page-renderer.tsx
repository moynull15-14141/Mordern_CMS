import type { RenderContext } from '../types/render-context.types';
import type { PublicPageContent } from '../types/content.types';

/**
 * Renders a resolved `Page`. `body` is rendered as an inert placeholder,
 * not parsed/interpreted — turning `Page.body`'s opaque JSON into real
 * HTML is Block/Rich-Content Engine work, explicitly out of scope for this
 * milestone (see the milestone brief's "Do NOT build Block Engine").
 */
export function PageRenderer({ context }: { context: RenderContext }) {
  const content = context.content as PublicPageContent;
  return (
    <article data-testid="page-renderer" className="container-page px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {content.title}
      </h1>
      {content.seo?.description ? (
        <p className="mt-4 text-lg text-gray-600">{content.seo.description}</p>
      ) : null}
      <div data-testid="page-body-placeholder" aria-hidden className="mt-8 text-gray-700">
        {/* Placeholder only — see this file's doc comment. */}
      </div>
    </article>
  );
}
