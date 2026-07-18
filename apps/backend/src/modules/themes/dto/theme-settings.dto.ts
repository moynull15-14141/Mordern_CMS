import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { HEX_COLOR_PATTERN } from '../constants/theme.constants';

/**
 * Theme-scoped appearance settings — stored as `Theme.settings` (JSON),
 * same "typed DTO on the wire, JSON column in the DB" pattern `SeoMeta`
 * already establishes for Articles/Categories/Pages (`ArticleSeoDto` etc).
 * Deliberately NOT part of the global `Settings` module (`settings.category.key`
 * architecture) — these values are per-Theme, not site-global, per this
 * milestone's own instruction ("theme-scoped settings, not global Settings
 * entries").
 *
 * `typography` stays a free-form JSON object (font family/sizes/weights)
 * rather than a fully-typed sub-DTO — same "typed columns for the fields
 * every module needs, JSON escape hatch for the long tail" reasoning
 * `MenuItem.layoutMeta` already uses; the brief lists "Typography" as one
 * example, not a fixed field set.
 */
export class ThemeSettingsDto {
  @ApiPropertyOptional({ description: 'Media URL or reference for the site logo.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  logo?: string;

  @ApiPropertyOptional({ description: 'Media URL or reference for the site favicon.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  favicon?: string;

  @ApiPropertyOptional({ example: '#1a2b3c' })
  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR_PATTERN, {
    message: 'primaryColor must be a valid hex color, e.g. "#1a2b3c".',
  })
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#ffffff' })
  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR_PATTERN, {
    message: 'secondaryColor must be a valid hex color, e.g. "#ffffff".',
  })
  secondaryColor?: string;

  @ApiPropertyOptional({ type: Object, description: 'Font family/sizes/weights — open-ended.' })
  @IsOptional()
  @IsObject()
  typography?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Open-ended layout identifier, e.g. "centered"/"full-width".',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  headerLayout?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  footerLayout?: string;

  @ApiPropertyOptional({ example: '1200px' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  containerWidth?: string;

  @ApiPropertyOptional({ example: '8px' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  borderRadius?: string;

  @ApiPropertyOptional({
    description: 'Open-ended button style identifier, e.g. "rounded"/"square"/"pill".',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  buttonStyle?: string;

  @ApiPropertyOptional({ description: 'Open-ended layout identifier for the homepage.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  homepageLayout?: string;

  @ApiPropertyOptional({
    description: 'Open-ended layout identifier for the blog/article listing.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  blogLayout?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  customCss?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50000)
  customJs?: string;
}
