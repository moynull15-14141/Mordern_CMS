import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadRenderContext } from '@/features/public/renderer/load-render-context';
import { resolveContent } from '@/features/public/resolver/content-resolver';
import { PublicLayout } from '@/features/public/components/public-layout';
import { JsonLd } from '@/features/public/components/json-ld';
import { buildMetadataFromSeo } from '@/features/public/utils/metadata.util';

interface RouteProps {
  params: Promise<{ slug: string }>;
}

/**
 * `/blog/[slug]` — uses `GET /public/articles/slug/:slug` (via
 * `resolveContent`; the `blog` URL segment maps to the real `article`
 * content type — see `route-shape.util.ts`). Same `cache()`-dedupe
 * reasoning as `/page/[slug]`.
 */
export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await resolveContent(`/blog/${slug}`);
  if (content.type !== 'article') return {};
  return buildMetadataFromSeo(content.seo, content.title, `/blog/${slug}`);
}

export default async function BlogDetailRoute({ params }: RouteProps) {
  const { slug } = await params;
  const context = await loadRenderContext(resolveContent(`/blog/${slug}`));

  if (context.content.type === 'not-found') {
    notFound();
  }

  return (
    <>
      {context.content.type === 'article' ? (
        <JsonLd data={context.content.seo?.schemaJson} />
      ) : null}
      <PublicLayout context={context} />
    </>
  );
}
