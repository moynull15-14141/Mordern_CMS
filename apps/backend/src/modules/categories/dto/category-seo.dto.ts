import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

/** Mirrors the frozen `SeoMeta` model's editable fields — same pattern
 * Articles uses (`46_ARTICLES_ARCHITECTURE.md` "Future Integrations: SEO").
 * Never duplicates SEO logic: this DTO shape and the upsert-into-SeoMeta
 * behavior are the same as Articles', just applied to Category. */
export class CategorySeoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  canonicalUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  openGraph?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  twitterCard?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  schemaJson?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  robots?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  extraMeta?: Record<string, unknown>;
}
