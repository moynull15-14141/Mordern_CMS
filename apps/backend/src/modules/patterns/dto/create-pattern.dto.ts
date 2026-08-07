import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  CATEGORY_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  MAX_TAGS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  TAG_MAX_LENGTH,
} from '../constants/patterns.constants';

/**
 * `body` is validated for shape by the existing `BlockTreeValidator`
 * (the identical `{blocks: BlockNode[]}` shape Page/Article bodies use —
 * see `PatternsService.createPattern`), not redeclared here, same
 * reasoning `CreateReusableBlockDto` keeps `data`/`children` as
 * `@IsObject()`/`@IsArray()` and pushes shape validation to the service.
 */
export class CreatePatternDto {
  @ApiProperty()
  @IsString()
  @MinLength(NAME_MIN_LENGTH)
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @ApiPropertyOptional({ description: 'Auto-generated from name when omitted.' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional({
    description: 'Free-text grouping label, e.g. "Hero", "Pricing", "Custom".',
  })
  @IsOptional()
  @IsString()
  @MaxLength(CATEGORY_MAX_LENGTH)
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_TAGS)
  @IsString({ each: true })
  @MaxLength(TAG_MAX_LENGTH, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Existing MediaAsset id to use as the list/grid thumbnail.' })
  @IsOptional()
  @IsUUID()
  thumbnailMediaId?: string;

  @ApiProperty({
    type: Object,
    description:
      'The full block tree — `{ blocks: BlockNode[] }`, identical shape to Page/Article body.',
  })
  @IsObject()
  body!: Record<string, unknown>;
}
