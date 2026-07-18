import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ThemeSettingsDto } from './theme-settings.dto';

/** Mirrors `CreatePageDto`/`CreateMenuDto`'s shape — no `status`/`isActive`
 * field; every created theme starts DRAFT and inactive (server-assigned),
 * matching Pages/Articles/Menus. Activation is a separate, dedicated
 * action (`POST /themes/:id/activate`) per this milestone's own rules. */
export class CreateThemeDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Omit to auto-generate from name.' })
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

  @ApiPropertyOptional({ description: 'Media URL or reference for the theme thumbnail.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  thumbnail?: string;

  @ApiPropertyOptional({ type: ThemeSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeSettingsDto)
  settings?: ThemeSettingsDto;
}
