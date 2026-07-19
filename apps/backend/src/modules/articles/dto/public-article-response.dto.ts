import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Rendering-only SEO shape — see `PublicPageSeoDto`'s doc comment
 * (`modules/pages/dto/public-page-response.dto.ts`) for why this is a
 * separate class per module rather than a shared/reused Admin DTO, and why
 * `extraMeta` is excluded. */
export class PublicArticleSeoDto {
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

/** No `id`/`userId` — a public byline only ever needs the display name. */
export class PublicArticleAuthorDto {
  @ApiProperty()
  penName!: string;
}

/** No `id` — a public reference to a category only ever needs `name`/`slug`. */
export class PublicArticleCategoryDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

/** No `id` — see `PublicArticleCategoryDto`. */
export class PublicArticleTagDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  primary!: boolean;
}

/**
 * List-item shape for `GET /public/articles` — deliberately excludes
 * `body` (heavy; only the detail endpoint needs it) and `seo` (not
 * rendered in a listing).
 */
export class PublicArticleListItemDto {
  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  subtitle!: string | null;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional({ nullable: true })
  summary!: string | null;

  @ApiProperty({ nullable: true })
  publishedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  readingTime!: number | null;

  @ApiProperty({ type: PublicArticleAuthorDto })
  author!: PublicArticleAuthorDto;

  @ApiProperty({ type: PublicArticleCategoryDto, nullable: true })
  category!: PublicArticleCategoryDto | null;

  @ApiProperty({ type: [PublicArticleTagDto] })
  tags!: PublicArticleTagDto[];
}

/**
 * Detail shape for `GET /public/articles/slug/:slug` — public, rendering-only
 * shape for a published `Article` (Milestone 13.2). Excludes `id`,
 * `authorId`/`primaryCategoryId`/`featuredMediaId` (internal ids — see
 * `PublicArticleAuthorDto`/`PublicArticleCategoryDto`), `status`/`visibility`
 * (both fixed to allowed values by construction — see
 * `PublicArticlesService`), `scheduledAt`, `notes` (editorial-only), and
 * every audit field the admin `ArticleResponseDto` exposes.
 */
export class PublicArticleResponseDto extends PublicArticleListItemDto {
  @ApiProperty({
    type: Object,
    description:
      'Opaque rich-content JSON document. Rendering its structure into HTML is Block/Rich-Content Engine work, out of scope for this milestone.',
  })
  body!: unknown;

  @ApiPropertyOptional({ nullable: true })
  wordCount!: number | null;

  @ApiProperty()
  language!: string;

  @ApiProperty()
  locale!: string;

  @ApiPropertyOptional({ nullable: true })
  canonicalUrl!: string | null;

  @ApiProperty({ type: PublicArticleSeoDto, nullable: true })
  seo!: PublicArticleSeoDto | null;
}
