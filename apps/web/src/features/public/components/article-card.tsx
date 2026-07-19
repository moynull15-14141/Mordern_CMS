import Link from 'next/link';
import type { PublicArticleListItem } from '../types/content.types';

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Reusable article summary card — used by the blog list, and by the
 * home page's Latest/Featured sections (milestone brief: "Use reusable
 * React components"). No cover image: `GET /public/articles` exposes no
 * image URL field (`Article.featuredMediaId` was deliberately excluded as
 * an internal id in Milestone 13.2) — see
 * docs/76_FRONTEND_PUBLIC_WEBSITE.md "Known Limitations".
 */
export function ArticleCard({ article }: { article: PublicArticleListItem }) {
  const publishedAt = formatDate(article.publishedAt);

  return (
    <article className="group flex flex-col gap-3 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
      {article.category ? (
        <Link
          href={`/category/${article.category.slug}`}
          className="w-fit text-xs font-semibold uppercase tracking-wide text-[var(--sportingspy-color-primary)] hover:underline"
        >
          {article.category.name}
        </Link>
      ) : null}

      <h3 className="text-lg font-semibold text-gray-900">
        <Link href={`/blog/${article.slug}`} className="group-hover:underline">
          {article.title}
        </Link>
      </h3>

      {article.summary ? (
        <p className="line-clamp-2 text-sm text-gray-600">{article.summary}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <span>{article.author.penName}</span>
        {publishedAt ? (
          <>
            <span aria-hidden>·</span>
            <time dateTime={article.publishedAt ?? undefined}>{publishedAt}</time>
          </>
        ) : null}
        {article.readingTime ? (
          <>
            <span aria-hidden>·</span>
            <span>{article.readingTime} min read</span>
          </>
        ) : null}
      </div>
    </article>
  );
}
