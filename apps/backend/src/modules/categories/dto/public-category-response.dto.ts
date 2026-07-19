import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Rendering-only SEO shape — see `PublicPageSeoDto`'s doc comment
 * (`modules/pages/dto/public-page-response.dto.ts`) for why this is a
 * separate class per module rather than a shared/reused Admin DTO, and why
 * `extraMeta` is excluded. */
export class PublicCategorySeoDto {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  canonicalUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  keywords?: string[];

  @ApiPropertyOptional({ type: Object })
  openGraph?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  twitterCard?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  schemaJson?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  robots?: Record<string, unknown>;
}

/**
 * Public, rendering-only shape for an active `Category` — powers
 * `GET /public/categories` and `GET /public/categories/slug/:slug`
 * (Milestone 13.2). Excludes `id`, `parentId` (no public category-tree
 * feature exists yet — see docs/75_BACKEND_PUBLIC_CONTENT_API.md "Known
 * Limitations"), `sortOrder`, `childrenCount`, `status` (always ACTIVE by
 * construction), and every audit field the admin `CategoryResponseDto`
 * exposes. `articleCount` is kept — it's a live-computed, non-sensitive
 * number useful for public category listings.
 */
export class PublicCategoryResponseDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  articleCount!: number;

  @ApiProperty({ type: PublicCategorySeoDto, nullable: true })
  seo!: PublicCategorySeoDto | null;
}
