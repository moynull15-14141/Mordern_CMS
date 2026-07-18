import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { PageSeoDto } from './page-seo.dto';

/** PATCH semantics — every field optional. `status` here is restricted to
 * DRAFT/REVIEW/ARCHIVED at the service layer (see
 * PagesValidator.assertGenericUpdateStatus) — PUBLISHED requires the
 * dedicated /publish endpoint. Mirrors `UpdateArticleDto`. */
export class UpdatePageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  body?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ type: PageSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PageSeoDto)
  seo?: PageSeoDto;
}
