import { Injectable } from '@nestjs/common';
import { CategoryResponseDto } from '../dto/category-response.dto';
import {
  PublicCategoryResponseDto,
  PublicCategorySeoDto,
} from '../dto/public-category-response.dto';

/**
 * Trims the existing (admin-shaped) `CategoryResponseDto` — already
 * produced by the real, reused `CategoriesService` — down to the public,
 * rendering-only shape. No new query, no new business logic.
 */
@Injectable()
export class PublicCategoriesMapper {
  private toSeoDto(seo: CategoryResponseDto['seo']): PublicCategorySeoDto | null {
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

  toPublicResponseDto(category: CategoryResponseDto): PublicCategoryResponseDto {
    return {
      name: category.name,
      slug: category.slug,
      description: category.description,
      articleCount: category.articleCount,
      seo: this.toSeoDto(category.seo),
    };
  }
}
