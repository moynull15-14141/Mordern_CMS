import Link from 'next/link';
import type { PublicArticleListItem } from '../types/content.types';
import { ArticleCard } from './article-card';

/** Reusable "heading + article cards" section — used for Home's "Latest
 * Articles" and "Featured Articles" sections (milestone brief: "Use
 * reusable React components"), parameterized so neither is a bespoke,
 * one-off layout. */
export function ArticleListSection({
  title,
  articles,
  viewAllHref,
}: {
  title: string;
  articles: PublicArticleListItem[];
  viewAllHref?: string;
}) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby={`${title}-heading`.replace(/\s+/g, '-').toLowerCase()}>
      <div className="flex items-center justify-between">
        <h2
          id={`${title}-heading`.replace(/\s+/g, '-').toLowerCase()}
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          {title}
        </h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-[var(--sportingspy-color-primary)] hover:underline"
          >
            View all →
          </Link>
        ) : null}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
