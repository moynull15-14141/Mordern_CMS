import { Injectable } from '@nestjs/common';
import { SeoResponseDto } from '../dto/seo-response.dto';
import { PublicSeoResponseDto } from '../dto/public-seo-response.dto';

/** Trims the existing (admin-shaped) `SeoResponseDto` — already produced
 * by the real, reused `SeoService` — down to the public shape. No new
 * query, no new business logic. */
@Injectable()
export class PublicSeoMapper {
  toPublicResponseDto(seo: SeoResponseDto): PublicSeoResponseDto {
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      canonicalUrl: seo.canonicalUrl,
      openGraph: seo.openGraph,
      twitterCard: seo.twitterCard,
      schemaJson: seo.schemaJson,
      robots: seo.robots,
    };
  }
}
