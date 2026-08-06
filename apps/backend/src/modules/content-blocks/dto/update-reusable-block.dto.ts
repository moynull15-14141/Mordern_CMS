import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  CATEGORY_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from '../constants/reusable-block.constants';

/** PATCH semantics — every field optional. Mirrors `UpdateLayoutDto`.
 * `blockType` is intentionally not editable — a reusable block's `data`
 * (and `children`) must stay shaped for the type it was created with;
 * changing the type is "delete and create a new one," not an update. */
export class UpdateReusableBlockDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(NAME_MIN_LENGTH)
  @MaxLength(NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(CATEGORY_MAX_LENGTH)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  children?: Record<string, unknown>[];
}
