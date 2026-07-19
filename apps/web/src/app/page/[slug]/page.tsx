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
 * `/page/[slug]` — uses `GET /public/pages/slug/:slug` (via
 * `resolveContent`). `generateMetadata` and the page component both call
 * `resolveContent` with the same pathname; it's `cache()`-wrapped, so this
 * is one backend request, not two (Performance: "No duplicate API calls").
 */
export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await resolveContent(`/page/${slug}`);
  if (content.type !== 'page') return {};
  return buildMetadataFromSeo(content.seo, content.title, `/page/${slug}`);
}

export default async function PageDetailRoute({ params }: RouteProps) {
  const { slug } = await params;
  const context = await loadRenderContext(resolveContent(`/page/${slug}`));

  if (context.content.type === 'not-found') {
    notFound();
  }

  return (
    <>
      {context.content.type === 'page' ? <JsonLd data={context.content.seo?.schemaJson} /> : null}
      <PublicLayout context={context} />
    </>
  );
}
