import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { HEX_COLOR_PATTERN } from '../constants/theme.constants';

/**
 * Milestone 8 (Advanced Site Design System) — the Site Design Token
 * model. Lives entirely inside the existing `Theme.settings` JSON column
 * as `settings.designTokens` (see `ThemeSettingsDto`), the same "typed
 * DTO on the wire, JSON column in the DB" escape hatch `typography`
 * already uses — this is genuinely additive: no Prisma migration, no new
 * table, no new endpoint. `null`/absent means "this theme has no design
 * tokens yet" (a pre-M8 theme), and every consumer (mapper, public CSS
 * variable generation) treats that as "fall back to the legacy flat
 * fields / static defaults," never a crash.
 *
 * Values are validated as non-empty, length-capped strings (CSS-value
 * shaped: a hex color, a length like "1rem"/"16px", a font-family list,
 * a font-weight number-as-string) rather than deeply typed CSS unions —
 * same "typed columns for the fields every module needs, string escape
 * hatch for the long tail of valid CSS value syntax" reasoning
 * `borderRadius`/`containerWidth` already establish on the legacy fields.
 * Colors specifically get the same `HEX_COLOR_PATTERN` check every other
 * color field in this module already uses.
 */
function hexColor() {
  return Matches(HEX_COLOR_PATTERN, { message: 'must be a valid hex color, e.g. "#1a2b3c".' });
}

function cssValue(maxLength = 50) {
  return MaxLength(maxLength, { message: `Must be ${maxLength} characters or fewer.` });
}

export class DesignTokenBrandColorsDto {
  @ApiPropertyOptional({ example: '#111827' })
  @IsOptional()
  @IsString()
  @hexColor()
  primary?: string;

  @ApiPropertyOptional({ example: '#6b7280' })
  @IsOptional()
  @IsString()
  @hexColor()
  secondary?: string;

  @ApiPropertyOptional({ example: '#f59e0b' })
  @IsOptional()
  @IsString()
  @hexColor()
  accent?: string;
}

export class DesignTokenBackgroundColorsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() page?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() surface?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() surfaceElevated?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() section?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() inverse?: string;
}

export class DesignTokenTextColorsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() primary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() secondary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() muted?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() inverse?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() link?: string;
}

export class DesignTokenBorderColorsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() default?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() strong?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() focus?: string;
}

export class DesignTokenStatusColorsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() success?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() warning?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() error?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() info?: string;
}

export class DesignTokenColorsDto {
  @ApiPropertyOptional({ type: DesignTokenBrandColorsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenBrandColorsDto)
  brand?: DesignTokenBrandColorsDto;

  @ApiPropertyOptional({ type: DesignTokenBackgroundColorsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenBackgroundColorsDto)
  background?: DesignTokenBackgroundColorsDto;

  @ApiPropertyOptional({ type: DesignTokenTextColorsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTextColorsDto)
  text?: DesignTokenTextColorsDto;

  @ApiPropertyOptional({ type: DesignTokenBorderColorsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenBorderColorsDto)
  border?: DesignTokenBorderColorsDto;

  @ApiPropertyOptional({ type: DesignTokenStatusColorsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenStatusColorsDto)
  status?: DesignTokenStatusColorsDto;
}

export class DesignTokenFontFamiliesDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(300) heading?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(300) body?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(300) ui?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(300) mono?: string;
}

/** One typography "style" (h1, body, button, …) — font size/weight/line
 * height/letter spacing as CSS-value strings (e.g. "2rem", "700",
 * "1.4", "0.02em"), plus an optional text-transform keyword. */
export class DesignTokenTypographyStyleDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue() fontSize?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(10) fontWeight?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(10) lineHeight?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(10) letterSpacing?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['none', 'uppercase', 'lowercase', 'capitalize'])
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export const TYPOGRAPHY_STYLE_KEYS = [
  'display',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'body',
  'bodyLarge',
  'bodySmall',
  'caption',
  'label',
  'button',
  'link',
] as const;

export class DesignTokenTypographyStylesDto {
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  display?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  h1?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  h2?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  h3?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  h4?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  h5?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  h6?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  body?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  bodyLarge?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  bodySmall?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  caption?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  label?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  button?: DesignTokenTypographyStyleDto;
  @ApiPropertyOptional({ type: DesignTokenTypographyStyleDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStyleDto)
  link?: DesignTokenTypographyStyleDto;
}

export class DesignTokenTypographyDto {
  @ApiPropertyOptional({ type: DesignTokenFontFamiliesDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenFontFamiliesDto)
  fontFamilies?: DesignTokenFontFamiliesDto;

  @ApiPropertyOptional({ type: DesignTokenTypographyStylesDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyStylesDto)
  styles?: DesignTokenTypographyStylesDto;
}

export class DesignTokenSpacingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(20) xs?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(20) sm?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(20) md?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(20) lg?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(20) xl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(20) xxl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(20) xxxl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(20) xxxxl?: string;
}

export class DesignTokenContainerDto {
  @ApiPropertyOptional({ example: '1200px' })
  @IsOptional()
  @IsString()
  @cssValue()
  maxWidth?: string;
  @ApiPropertyOptional({ example: '1440px' })
  @IsOptional()
  @IsString()
  @cssValue()
  wideWidth?: string;
  @ApiPropertyOptional({ example: '100%' })
  @IsOptional()
  @IsString()
  @cssValue()
  fullWidth?: string;
  @ApiPropertyOptional({ example: '1.5rem' })
  @IsOptional()
  @IsString()
  @cssValue()
  paddingX?: string;
  @ApiPropertyOptional({ example: '4rem' })
  @IsOptional()
  @IsString()
  @cssValue()
  sectionSpacing?: string;
}

export class DesignTokenButtonVariantDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() background?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() text?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() border?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() hoverBackground?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() hoverText?: string;
}

export class DesignTokenButtonVariantsDto {
  @ApiPropertyOptional({ type: DesignTokenButtonVariantDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenButtonVariantDto)
  primary?: DesignTokenButtonVariantDto;
  @ApiPropertyOptional({ type: DesignTokenButtonVariantDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenButtonVariantDto)
  secondary?: DesignTokenButtonVariantDto;
  @ApiPropertyOptional({ type: DesignTokenButtonVariantDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenButtonVariantDto)
  outline?: DesignTokenButtonVariantDto;
  @ApiPropertyOptional({ type: DesignTokenButtonVariantDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenButtonVariantDto)
  ghost?: DesignTokenButtonVariantDto;
  @ApiPropertyOptional({ type: DesignTokenButtonVariantDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenButtonVariantDto)
  destructive?: DesignTokenButtonVariantDto;
  @ApiPropertyOptional({ type: DesignTokenButtonVariantDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenButtonVariantDto)
  link?: DesignTokenButtonVariantDto;
}

export class DesignTokenButtonsDto {
  @ApiPropertyOptional({ example: '0.5rem' }) @IsOptional() @IsString() @cssValue() radius?: string;
  @ApiPropertyOptional({ example: '2.5rem' }) @IsOptional() @IsString() @cssValue() height?: string;
  @ApiPropertyOptional({ example: '1.25rem' })
  @IsOptional()
  @IsString()
  @cssValue()
  paddingX?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue() shadow?: string;

  @ApiPropertyOptional({ type: DesignTokenButtonVariantsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenButtonVariantsDto)
  variants?: DesignTokenButtonVariantsDto;
}

export class DesignTokenCardsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() background?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() border?: string;
  @ApiPropertyOptional({ example: '0.75rem' })
  @IsOptional()
  @IsString()
  @cssValue()
  radius?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue() shadow?: string;
  @ApiPropertyOptional({ example: '1.5rem' })
  @IsOptional()
  @IsString()
  @cssValue()
  padding?: string;
}

export class DesignTokenFormsDto {
  @ApiPropertyOptional({ example: '2.5rem' })
  @IsOptional()
  @IsString()
  @cssValue()
  inputHeight?: string;
  @ApiPropertyOptional({ example: '0.375rem' })
  @IsOptional()
  @IsString()
  @cssValue()
  inputRadius?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() inputBorder?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() inputBackground?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() labelColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() placeholderColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() focusColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() errorColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() helperColor?: string;
}

export class DesignTokenBackgroundDto {
  @ApiPropertyOptional({ enum: ['solid', 'gradient', 'image'] })
  @IsOptional()
  @IsIn(['solid', 'gradient', 'image'])
  type?: 'solid' | 'gradient' | 'image';

  @ApiPropertyOptional({
    description: 'Hex color (solid), CSS gradient expression, or media URL (image).',
  })
  @IsOptional()
  @IsString()
  @cssValue(2000)
  value?: string;
}

export class DesignTokenHeaderDto {
  @ApiPropertyOptional({ description: 'Media id/URL for the header logo.' })
  @IsOptional()
  @IsString()
  @cssValue(2000)
  logoMediaId?: string;
  @ApiPropertyOptional() @IsOptional() menuId?: string;
  @ApiPropertyOptional() @IsOptional() sticky?: boolean;
  @ApiPropertyOptional({ example: '4rem' }) @IsOptional() @IsString() @cssValue() height?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() background?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() textColor?: string;
  @ApiPropertyOptional() @IsOptional() showBorder?: boolean;
  @ApiPropertyOptional() @IsOptional() showShadow?: boolean;
  @ApiPropertyOptional() @IsOptional() showCta?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(100) ctaLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(2000) ctaHref?: string;
}

export class DesignTokenFooterSocialLinkDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(50) platform?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(2000) href?: string;
}

export class DesignTokenFooterDto {
  @ApiPropertyOptional({ description: 'Media id/URL for the footer logo.' })
  @IsOptional()
  @IsString()
  @cssValue(2000)
  logoMediaId?: string;
  @ApiPropertyOptional() @IsOptional() menuId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() background?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @hexColor() textColor?: string;
  @ApiPropertyOptional() @IsOptional() showNewsletter?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(500) contactInfo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @cssValue(300) copyrightText?: string;

  @ApiPropertyOptional({ type: [DesignTokenFooterSocialLinkDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DesignTokenFooterSocialLinkDto)
  socialLinks?: DesignTokenFooterSocialLinkDto[];
}

export class DesignTokenResponsiveOverrideDto {
  @ApiPropertyOptional({ example: '1rem' })
  @IsOptional()
  @IsString()
  @cssValue()
  containerPaddingX?: string;
  @ApiPropertyOptional({
    example: '0.9',
    description: 'Typography scale multiplier applied to font sizes.',
  })
  @IsOptional()
  @IsString()
  @cssValue(10)
  typographyScale?: string;
}

export class DesignTokenResponsiveDto {
  @ApiPropertyOptional({ type: DesignTokenResponsiveOverrideDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenResponsiveOverrideDto)
  tablet?: DesignTokenResponsiveOverrideDto;

  @ApiPropertyOptional({ type: DesignTokenResponsiveOverrideDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenResponsiveOverrideDto)
  mobile?: DesignTokenResponsiveOverrideDto;
}

/**
 * The root Site Design Token document — `settings.designTokens` on
 * `Theme`. `version` is a plain integer (starts at `1`), bumped only if
 * this shape ever needs a breaking change in the future; it's read-only
 * informational data for now (no migration logic keys off it yet, same
 * "reserve the field, don't build machinery with nothing to drive it
 * yet" precedent `role` sets on `JwtPayload`).
 */
export class DesignTokensDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @ApiPropertyOptional({
    description: 'Which design preset (if any) this theme started from — informational only.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  preset?: string;

  @ApiPropertyOptional({ type: DesignTokenColorsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenColorsDto)
  colors?: DesignTokenColorsDto;

  @ApiPropertyOptional({ type: DesignTokenTypographyDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenTypographyDto)
  typography?: DesignTokenTypographyDto;

  @ApiPropertyOptional({ type: DesignTokenSpacingDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenSpacingDto)
  spacing?: DesignTokenSpacingDto;

  @ApiPropertyOptional({ type: DesignTokenContainerDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenContainerDto)
  container?: DesignTokenContainerDto;

  @ApiPropertyOptional({ type: DesignTokenButtonsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenButtonsDto)
  buttons?: DesignTokenButtonsDto;

  @ApiPropertyOptional({ type: DesignTokenCardsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenCardsDto)
  cards?: DesignTokenCardsDto;

  @ApiPropertyOptional({ type: DesignTokenFormsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenFormsDto)
  forms?: DesignTokenFormsDto;

  @ApiPropertyOptional({ type: DesignTokenBackgroundDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenBackgroundDto)
  background?: DesignTokenBackgroundDto;

  @ApiPropertyOptional({ type: DesignTokenHeaderDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenHeaderDto)
  header?: DesignTokenHeaderDto;

  @ApiPropertyOptional({ type: DesignTokenFooterDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenFooterDto)
  footer?: DesignTokenFooterDto;

  @ApiPropertyOptional({ type: DesignTokenResponsiveDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DesignTokenResponsiveDto)
  responsive?: DesignTokenResponsiveDto;
}
