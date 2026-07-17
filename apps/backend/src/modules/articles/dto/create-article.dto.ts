import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { ArticleVisibility } from '@prisma/client';
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

export class CreateArticleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(300)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Omit to auto-generate from title.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @ApiProperty({ type: Object, description: 'Rich content body (JSON document tree).' })
  @IsObject()
  body!: Record<string, unknown>;

  @ApiProperty({
    description:
      'Existing Author id — Author records are provisioned by a future Authors module, not this one.',
  })
  @IsUUID()
  authorId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  primaryCategoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'Which of tagIds is the primary tag, if any.' })
  @IsOptional()
  @IsUUID()
  primaryTagId?: string;

  @ApiPropertyOptional({ enum: ArticleVisibility, default: ArticleVisibility.PUBLIC })
  @IsOptional()
  @IsEnum(ArticleVisibility)
  visibility?: ArticleVisibility;

  @ApiProperty()
  @IsString()
  @MaxLength(10)
  language!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(10)
  locale!: string;

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
}
