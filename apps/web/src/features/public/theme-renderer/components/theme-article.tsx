import Link from 'next/link';
import type { PublicArticleListItem } from '../../types/content.types';
import { ThemeCard } from './theme-card';
import { ThemeTitle } from './theme-title';
import { ThemeMeta } from './theme-meta';

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Themed article summary card — the design-system equivalent of
 * `features/public/components/article-card.tsx` (Milestone 13.3), built
 * from `ThemeCard`/`ThemeTitle`/`ThemeMeta` instead of one-off markup.
 * Not yet adopted by `blog-list-renderer.tsx`/`home-renderer.tsx` (see
 * docs/77_THEME_RENDERING_SYSTEM.md "Remaining Limitations") — available
 * for a future renderer (Block Engine, Visual Builder) to compose with.
 */
export function ThemeArticle({ article }: { article: PublicArticleListItem }) {
  const publishedAt = formatDate(article.publishedAt);

  return (
    <ThemeCard className="flex flex-col gap-3">
      {article.category ? (
        <Link
          href={`/category/${article.category.slug}`}
          className="w-fit text-xs font-semibold uppercase tracking-wide text-[var(--sportingspy-color-primary)] hover:underline"
        >
          {article.category.name}
        </Link>
      ) : null}

      <ThemeTitle level={3}>
        <Link href={`/blog/${article.slug}`} className="hover:underline">
          {article.title}
        </Link>
      </ThemeTitle>

      {article.summary ? (
        <p className="line-clamp-2 text-sm text-[var(--sportingspy-color-muted)]">
          {article.summary}
        </p>
      ) : null}

      <ThemeMeta
        items={[
          { key: 'author', content: article.author.penName },
          {
            key: 'date',
            content: publishedAt ? (
              <time dateTime={article.publishedAt ?? undefined}>{publishedAt}</time>
            ) : null,
          },
          {
            key: 'reading-time',
            content: article.readingTime ? `${article.readingTime} min read` : null,
          },
        ]}
      />
    </ThemeCard>
  );
}
