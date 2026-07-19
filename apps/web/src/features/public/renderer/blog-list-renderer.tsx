import type { RenderContext } from '../types/render-context.types';
import type { PublicBlogListContent } from '../types/content.types';
import { ArticleCard } from '../components/article-card';
import { Pagination } from '../components/pagination';
import { SearchForm } from '../components/search-form';

/** Renders `/blog` — server-paginated article list with search (milestone
 * brief: "server pagination, search params, page navigation"). */
export function BlogListRenderer({ context }: { context: RenderContext }) {
  const content = context.content as PublicBlogListContent;
  return (
    <div data-testid="blog-list-renderer" className="container-page px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Blog</h1>
        <SearchForm action="/blog" defaultValue={content.search ?? undefined} />
      </div>

      {content.articles.length === 0 ? (
        <p data-testid="blog-list-empty" className="mt-12 text-center text-gray-500">
          {content.search
            ? `No articles match "${content.search}".`
            : 'No articles have been published yet.'}
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {content.articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}

      <Pagination
        basePath="/blog"
        pagination={content.pagination}
        extraParams={{ search: content.search ?? undefined }}
      />
    </div>
  );
}
