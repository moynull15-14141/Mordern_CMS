import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Rendering-only SEO shape for the Public Pages API — mirrors the fields on
 * `PageSeoDto` (`page-seo.dto.ts`) that are actually meaningful to render
 * into `<head>` tags. Deliberately a separate class, never `PageSeoDto`
 * itself (Milestone 13.2 brief: "Never reuse Admin DTOs"). `extraMeta` is
 * intentionally excluded — it is an open, loosely-typed escape hatch with
 * no guaranteed public-safe contents (see docs/75_BACKEND_PUBLIC_CONTENT_API.md
 * "Public DTO Rules").
 */
export class PublicPageSeoDto {
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
 * List-item shape for `GET /public/pages` — deliberately excludes `body`
 * (heavy; only the detail endpoint needs it) and the full `seo` object
 * (not rendered in a listing — mirrors `PublicArticleListItemDto`'s exact
 * reasoning), keeping only what `apps/web`'s sitemap generator needs:
 * `updatedAt` (lastmod) and a derived `noIndex` flag.
 */
export class PublicPageListItemDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  publishedAt!: string | null;

  @ApiProperty({
    description: 'Last modified timestamp — used as sitemap.xml lastmod, not rendered in the UI.',
  })
  updatedAt!: string;

  @ApiProperty({
    description:
      'True when this page is marked noindex — sitemap.xml excludes it. Derived from ' +
      '`seo.robots.index`; the full `seo` object itself is excluded from listings by design.',
  })
  noIndex!: boolean;
}

/**
 * Public, rendering-only shape for a published `Page` — powers
 * `GET /public/pages/slug/:slug` (Milestone 13.2). Deliberately excludes
 * `id` (no public use for it — a page is addressed by `slug`), `status`
 * (always PUBLISHED by construction — see `PublicPagesService`), and every
 * audit field (`createdAt`/`updatedAt`/`deletedAt`/`createdBy`/`updatedBy`/
 * `deletedBy`) the admin `PageResponseDto` exposes.
 */
export class PublicPageResponseDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({
    type: Object,
    description:
      'Opaque rich-content JSON document. Rendering its structure into HTML is Block/Rich-Content Engine work, out of scope for this milestone.',
  })
  body!: unknown;

  @ApiProperty({ nullable: true })
  publishedAt!: string | null;

  @ApiProperty({ type: PublicPageSeoDto, nullable: true })
  seo!: PublicPageSeoDto | null;
}
