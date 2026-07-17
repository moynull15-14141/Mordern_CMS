import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CategorySeoDto } from './category-seo.dto';

/** PATCH semantics. Parent changes go through the dedicated
 * `/categories/:id/move` endpoint, not this one — see
 * docs/47_CATEGORY_TAG_ARCHITECTURE.md "Hierarchy". */
export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ type: CategorySeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CategorySeoDto)
  seo?: CategorySeoDto;
}
