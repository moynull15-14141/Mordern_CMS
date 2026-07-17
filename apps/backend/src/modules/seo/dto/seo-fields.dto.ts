import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from '../constants/seo.constants';

/**
 * Every field already available on the frozen `SeoMeta` model, nothing
 * more (`36_DATABASE_FREEZE.md`) — shared by `CreateSeoDto`, `UpdateSeoDto`,
 * `UpsertSeoDto`, and the request bodies of `POST /seo/preview` and
 * `POST /seo/validate` (all "a candidate set of SEO fields"), avoiding
 * five near-identical field lists. Structural bounds (`title`/`description`
 * max length) mirror `ArticleSeoDto` exactly (see `constants/seo.constants.ts`);
 * deeper OpenGraph/Twitter/robots/JSON-LD field validation happens in
 * `SeoValidator`, not here, since those are JSON blobs with no fixed shape
 * at the schema level.
 */
export class SeoFieldsDto {
  @ApiPropertyOptional({ maxLength: SEO_TITLE_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(SEO_TITLE_MAX_LENGTH)
  title?: string;

  @ApiPropertyOptional({ maxLength: SEO_DESCRIPTION_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(SEO_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({
    description:
      'Normalized before persistence — see canonical URL strategy in the architecture doc.',
  })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'title, description, image, type, url, site_name, locale',
  })
  @IsOptional()
  @IsObject()
  openGraph?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: Object,
    description: 'title, description, image, card, creator, site',
  })
  @IsOptional()
  @IsObject()
  twitterCard?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: Object,
    description: 'JSON-LD structured data — stored and validated only, no schema generation.',
  })
  @IsOptional()
  @IsObject()
  schemaJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: Object,
    description:
      'index, noindex, follow, nofollow, nosnippet, max-image-preview, max-video-preview, max-snippet',
  })
  @IsOptional()
  @IsObject()
  robots?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  extraMeta?: Record<string, unknown>;
}
