import type { Metadata } from 'next';
import { loadRenderContext } from '@/features/public/renderer/load-render-context';
import { loadBlogListContent } from '@/features/public/resolver/load-blog-list-content';
import { PublicLayout } from '@/features/public/components/public-layout';

interface RouteProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export async function generateMetadata({ searchParams }: RouteProps): Promise<Metadata> {
  const { search } = await searchParams;
  return {
    title: 'Blog',
    description: search ? `Articles matching "${search}".` : 'Browse every published article.',
  };
}

/**
 * `/blog` — uses `GET /public/articles` with server-side pagination and
 * search (milestone brief). Real input is `searchParams`, not a slug — see
 * `load-blog-list-content.ts`'s doc comment for why this doesn't go
 * through `content-resolver.ts`.
 */
export default async function BlogListRoute({ searchParams }: RouteProps) {
  const { page, search } = await searchParams;
  const context = await loadRenderContext(loadBlogListContent(page, search));
  return <PublicLayout context={context} />;
}
