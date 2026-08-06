import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '../constants/reusable-block.constants';

/** PATCH semantics — every field optional. Mirrors `UpdateLayoutDto`. */
export class UpdateReusableBlockDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(NAME_MIN_LENGTH)
  @MaxLength(NAME_MAX_LENGTH)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
