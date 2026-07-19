import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Public, rendering-only shape for `GET /public/seo/:entity/:slug`
 * (Milestone 13.2) — trims the admin `SeoResponseDto` down to exactly what
 * a `<head>` tag builder needs. Excludes `id`, `siteId`, `extraMeta` (see
 * `PublicPageSeoDto`'s doc comment,
 * `modules/pages/dto/public-page-response.dto.ts`, for why),
 * `schemaJsonPretty` (a presentation-only admin-editor convenience, not
 * rendering data), and every audit field.
 */
export class PublicSeoResponseDto {
  @ApiPropertyOptional({ nullable: true })
  title!: string | null;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({ type: [String] })
  keywords!: string[];

  @ApiPropertyOptional({ nullable: true })
  canonicalUrl!: string | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  openGraph!: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  twitterCard!: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  schemaJson!: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: Object, nullable: true })
  robots!: Record<string, unknown> | null;
}
