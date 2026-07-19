import { ApiPropertyOptional } from '@nestjs/swagger';
import { LayoutStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/** PATCH semantics — every field optional. Mirrors `UpdateThemeDto`. */
export class UpdateLayoutDto {
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
  @MaxLength(100)
  layoutPreset?: string;

  @ApiPropertyOptional({
    description: 'Pass null to clear ("compatible with any theme").',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  themeId?: string | null;

  @ApiPropertyOptional({ enum: LayoutStatus })
  @IsOptional()
  @IsEnum(LayoutStatus)
  status?: LayoutStatus;
}
