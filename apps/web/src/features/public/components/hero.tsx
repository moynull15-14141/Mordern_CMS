import Link from 'next/link';
import type { PublicArticleListItem } from '../types/content.types';

/**
 * Home page hero — real data only: site branding (`siteName`/`tagline`
 * from `GET /public/settings`) and, if available, the single most recent
 * published article (the first item `GET /public/articles` already
 * returned for the "Latest Articles" section — reused, not re-fetched).
 */
export function Hero({
  siteName,
  tagline,
  highlightArticle,
}: {
  siteName: string;
  tagline?: string;
  highlightArticle: PublicArticleListItem | null;
}) {
  return (
    <section className="border-b border-gray-200 pb-10 pt-4">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{siteName}</h1>
        {tagline ? <p className="mt-4 text-lg text-gray-600">{tagline}</p> : null}
      </div>

      {highlightArticle ? (
        <div className="mt-8 flex flex-col gap-2 rounded-[var(--sportingspy-border-radius)] border border-gray-200 p-6 sm:max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--sportingspy-color-primary)]">
            Latest
          </span>
          <h2 className="text-xl font-semibold text-gray-900">
            <Link href={`/blog/${highlightArticle.slug}`} className="hover:underline">
              {highlightArticle.title}
            </Link>
          </h2>
          {highlightArticle.summary ? (
            <p className="line-clamp-2 text-sm text-gray-600">{highlightArticle.summary}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
