import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/** Mirrors `CreateThemeDto`'s shape — no `status` field; every created
 * layout starts DRAFT (server-assigned), matching Themes/Pages/Articles.
 * No `blocks`/`content` field — "A Layout must NOT contain blocks. Only
 * structural information" (the milestone's own instruction). */
export class CreateLayoutDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Omit to auto-generate from name.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiProperty({
    description:
      'Open-ended layout identifier the frontend Theme Rendering System registers a renderer for, e.g. "default"/"sidebar-left"/"full-width".',
    example: 'default',
  })
  @IsString()
  @MaxLength(100)
  layoutPreset!: string;

  @ApiPropertyOptional({
    description:
      'Restrict this Layout to one specific Theme. Omit for "compatible with any theme".',
  })
  @IsOptional()
  @IsUUID()
  themeId?: string;
}
