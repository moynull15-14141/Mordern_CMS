import type { Metadata } from 'next';
import type { PublicSeo } from '../types/seo.types';

function stringField(source: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = source?.[key];
  return typeof value === 'string' ? value : undefined;
}

function imagesField(source: Record<string, unknown> | undefined): string[] | undefined {
  const image = source?.image;
  const images = source?.images;
  if (typeof image === 'string') return [image];
  if (Array.isArray(images))
    return images.filter((item): item is string => typeof item === 'string');
  return undefined;
}

function robotsField(source: Record<string, unknown> | undefined): Metadata['robots'] {
  if (!source) return undefined;
  const index = source.index;
  const follow = source.follow;
  if (typeof index !== 'boolean' && typeof follow !== 'boolean') return undefined;
  return {
    index: typeof index === 'boolean' ? index : undefined,
    follow: typeof follow === 'boolean' ? follow : undefined,
  };
}

/**
 * Builds a Next.js `Metadata` object from the real, embedded `seo` field
 * every detail route already has on its resolved content
 * (`PublicPageContent.seo`/`PublicArticleContent.seo`/
 * `PublicCategoryContent.seo`) — never a separate `/public/seo/:entity/:slug`
 * call for content already in hand (see `services/seo.service.ts`'s doc
 * comment). `openGraph`/`twitterCard`/`robots` are free-form JSON on the
 * backend (`SeoMeta.openGraph` etc. — no fixed schema), so every field
 * read here is defensively type-checked rather than assumed present.
 *
 * JSON-LD (`schemaJson`) has no Next.js Metadata API field — structured
 * data is injected via a `<script type="application/ld+json">` tag
 * instead; see `components/json-ld.tsx`.
 */
export function buildMetadataFromSeo(
  seo: PublicSeo | null,
  fallbackTitle: string,
  canonicalPath?: string
): Metadata {
  const title = seo?.title || fallbackTitle;
  const description = seo?.description;
  const openGraph = seo?.openGraph;
  const twitterCard = seo?.twitterCard;

  return {
    title,
    description,
    keywords: seo?.keywords,
    alternates:
      seo?.canonicalUrl || canonicalPath
        ? { canonical: seo?.canonicalUrl || canonicalPath }
        : undefined,
    openGraph: {
      title: stringField(openGraph, 'title') ?? title,
      description: stringField(openGraph, 'description') ?? description,
      images: imagesField(openGraph),
      type: (stringField(openGraph, 'type') as 'website' | 'article' | undefined) ?? undefined,
    },
    twitter: {
      card:
        (stringField(twitterCard, 'card') as 'summary' | 'summary_large_image' | undefined) ??
        undefined,
      title: stringField(twitterCard, 'title') ?? title,
      description: stringField(twitterCard, 'description') ?? description,
      images: imagesField(twitterCard),
    },
    robots: robotsField(seo?.robots),
  };
}
