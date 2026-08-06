import Link from 'next/link';
import type { RenderContext } from '../types/render-context.types';
import type { PublicArticleContent } from '../types/content.types';
import { BlockRenderer } from '../block-renderer/block-renderer';
import { parseBlocks } from '../block-renderer/utils/parse-blocks.util';

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Renders a resolved `Article` — title, author, publish date, category,
 * content, SEO. `body` renders through the Rich Content Engine's
 * `BlockRenderer` (Phase 1 / Step 1) — see `block-renderer/block-renderer.tsx`.
 *
 * **No cover image is rendered.** `GET /public/articles/slug/:slug`
 * exposes no image URL field — `Article.featuredMediaId` exists on the
 * model but was deliberately excluded from `PublicArticleResponseDto` as
 * an internal id (Milestone 13.2), and no resolved public image URL field
 * was added in its place. Rendering a real cover image needs a backend
 * change (e.g. a `featuredImageUrl` field resolved server-side); inventing
 * one here would violate Rule Zero. See
 * docs/76_FRONTEND_PUBLIC_WEBSITE.md "Known Limitations".
 */
export function ArticleRenderer({ context }: { context: RenderContext }) {
  const content = context.content as PublicArticleContent;
  const publishedAt = formatDate(content.publishedAt);

  return (
    <article data-testid="article-renderer" className="container-page px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {content.category ? (
          <Link
            href={`/category/${content.category.slug}`}
            className="text-xs font-semibold uppercase tracking-wide text-[var(--sportingspy-color-primary)] hover:underline"
          >
            {content.category.name}
          </Link>
        ) : null}

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {content.title}
        </h1>

        {content.subtitle ? <p className="mt-3 text-xl text-gray-600">{content.subtitle}</p> : null}

        <div
          data-testid="article-byline"
          className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-gray-200 py-3 text-sm text-gray-500"
        >
          <span className="font-medium text-gray-700">{content.author.penName}</span>
          {publishedAt ? (
            <>
              <span aria-hidden>·</span>
              <time dateTime={content.publishedAt ?? undefined}>{publishedAt}</time>
            </>
          ) : null}
          {content.readingTime ? (
            <>
              <span aria-hidden>·</span>
              <span>{content.readingTime} min read</span>
            </>
          ) : null}
        </div>

        {content.tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <li key={tag.slug}>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {tag.name}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 max-w-none space-y-4">
          <BlockRenderer blocks={parseBlocks(content.body)} />
        </div>
      </div>
    </article>
  );
}
