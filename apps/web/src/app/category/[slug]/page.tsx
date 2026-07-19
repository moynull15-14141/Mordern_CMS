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
 * `/category/[slug]` — uses `GET /public/categories/slug/:slug` (via
 * `resolveContent`). Same `cache()`-dedupe reasoning as `/page/[slug]`.
 */
export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await resolveContent(`/category/${slug}`);
  if (content.type !== 'category') return {};
  return buildMetadataFromSeo(content.seo, content.name, `/category/${slug}`);
}

export default async function CategoryDetailRoute({ params }: RouteProps) {
  const { slug } = await params;
  const context = await loadRenderContext(resolveContent(`/category/${slug}`));

  if (context.content.type === 'not-found') {
    notFound();
  }

  return (
    <>
      {context.content.type === 'category' ? (
        <JsonLd data={context.content.seo?.schemaJson} />
      ) : null}
      <PublicLayout context={context} />
    </>
  );
}
