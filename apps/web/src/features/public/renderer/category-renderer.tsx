import type { RenderContext } from '../types/render-context.types';
import type { PublicCategoryContent } from '../types/content.types';

/**
 * Renders a resolved `Category` — name, description, article count
 * (milestone brief: "Show category info").
 *
 * **No related-articles list is rendered.** The milestone brief says to
 * show related articles "if backend supports" it, otherwise document the
 * limitation honestly — it doesn't: `GET /public/articles`
 * (`PublicArticleQueryDto`) has no `categoryId`/`categorySlug` filter
 * param (verified against the real DTO, Milestone 13.2), so there is no
 * way to ask the backend for "articles in this category" at all. Adding
 * that filter is real backend work (see
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md "Future Integration"), not
 * something this frontend milestone can fetch without inventing a query
 * parameter the API doesn't accept.
 */
export function CategoryRenderer({ context }: { context: RenderContext }) {
  const content = context.content as PublicCategoryContent;
  return (
    <article data-testid="category-renderer" className="container-page px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {content.name}
      </h1>
      {content.description ? (
        <p className="mt-4 text-lg text-gray-600">{content.description}</p>
      ) : null}
      <p className="mt-2 text-sm text-gray-500">
        {content.articleCount} {content.articleCount === 1 ? 'article' : 'articles'} in this
        category
      </p>
      <p
        data-testid="category-related-articles-note"
        className="mt-10 rounded-[var(--sportingspy-border-radius)] border border-dashed border-gray-300 p-6 text-sm text-gray-500"
      >
        A list of articles in this category isn&apos;t available yet — the Public Articles API has
        no way to filter by category. See the project documentation for details.
      </p>
    </article>
  );
}
