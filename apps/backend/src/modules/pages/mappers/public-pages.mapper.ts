import { Injectable } from '@nestjs/common';
import { PageResponseDto } from '../dto/page-response.dto';
import { PublicPageResponseDto, PublicPageSeoDto } from '../dto/public-page-response.dto';

/**
 * Trims the existing (admin-shaped) `PageResponseDto` — already produced by
 * the real, reused `PagesService.getPageBySlug()` — down to the public,
 * rendering-only shape. No new query, no new business logic: this only
 * reshapes data `PagesService` already computed.
 */
@Injectable()
export class PublicPagesMapper {
  private toSeoDto(seo: PageResponseDto['seo']): PublicPageSeoDto | null {
    if (!seo) return null;
    return {
      title: seo.title,
      description: seo.description,
      canonicalUrl: seo.canonicalUrl,
      keywords: seo.keywords,
      openGraph: seo.openGraph,
      twitterCard: seo.twitterCard,
      schemaJson: seo.schemaJson,
      robots: seo.robots,
    };
  }

  toPublicResponseDto(page: PageResponseDto): PublicPageResponseDto {
    return {
      title: page.title,
      slug: page.slug,
      body: page.body,
      publishedAt: page.publishedAt,
      seo: this.toSeoDto(page.seo),
    };
  }
}
