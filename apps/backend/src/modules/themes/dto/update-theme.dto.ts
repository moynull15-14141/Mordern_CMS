import { ApiPropertyOptional } from '@nestjs/swagger';
import { ThemeStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ThemeSettingsDto } from './theme-settings.dto';

/** PATCH semantics — every field optional. No `isActive` field —
 * activation only ever happens via `POST /themes/:id/activate`, never a
 * generic update (same split Pages/Articles use for `status: PUBLISHED`). */
export class UpdateThemeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  thumbnail?: string;

  @ApiPropertyOptional({ enum: ThemeStatus })
  @IsOptional()
  @IsEnum(ThemeStatus)
  status?: ThemeStatus;

  @ApiPropertyOptional({ type: ThemeSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeSettingsDto)
  settings?: ThemeSettingsDto;
}
