import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleVisibility, ContentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ArticleSeoDto } from './article-seo.dto';

/** PATCH semantics — every field optional, only provided fields change.
 * `status` here is restricted to DRAFT/REVIEW/ARCHIVED at the service layer
 * (see ArticlesValidator.assertGenericUpdateStatus) — PUBLISHED/SCHEDULED
 * require the dedicated /publish and /schedule endpoints. */
export class UpdateArticleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  body?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  primaryCategoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  primaryTagId?: string;

  @ApiPropertyOptional({ enum: ArticleVisibility })
  @IsOptional()
  @IsEnum(ArticleVisibility)
  visibility?: ArticleVisibility;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  featuredMediaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ type: ArticleSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ArticleSeoDto)
  seo?: ArticleSeoDto;

  @ApiPropertyOptional({
    description: 'Optional edit summary recorded on the revision created by this update.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  revisionComment?: string;
}
