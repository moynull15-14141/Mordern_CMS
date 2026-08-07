import { z } from 'zod';
import { HEX_COLOR_PATTERN } from '../constants/theme.constants';

/** An optional hex color — `''` (untouched field) or a valid hex string,
 * same "optional-or-empty-string" shape every color field in this
 * feature already uses (`themeSettingsSchema`'s `primaryColor`). */
const hexColor = () =>
  z
    .union([
      z.literal(''),
      z.string().regex(HEX_COLOR_PATTERN, 'Must be a valid hex color, e.g. "#1a2b3c".'),
    ])
    .optional();

const cssValue = (max = 50) => z.string().max(max).optional().or(z.literal(''));

const brandColorsSchema = z.object({
  primary: hexColor(),
  secondary: hexColor(),
  accent: hexColor(),
});
const backgroundColorsSchema = z.object({
  page: hexColor(),
  surface: hexColor(),
  surfaceElevated: hexColor(),
  section: hexColor(),
  inverse: hexColor(),
});
const textColorsSchema = z.object({
  primary: hexColor(),
  secondary: hexColor(),
  muted: hexColor(),
  inverse: hexColor(),
  link: hexColor(),
});
const borderColorsSchema = z.object({ default: hexColor(), strong: hexColor(), focus: hexColor() });
const statusColorsSchema = z.object({
  success: hexColor(),
  warning: hexColor(),
  error: hexColor(),
  info: hexColor(),
});

export const designTokenColorsSchema = z.object({
  brand: brandColorsSchema.optional(),
  background: backgroundColorsSchema.optional(),
  text: textColorsSchema.optional(),
  border: borderColorsSchema.optional(),
  status: statusColorsSchema.optional(),
});

const fontFamiliesSchema = z.object({
  heading: cssValue(300),
  body: cssValue(300),
  ui: cssValue(300),
  mono: cssValue(300),
});

const typographyStyleSchema = z.object({
  fontSize: cssValue(),
  fontWeight: cssValue(10),
  lineHeight: cssValue(10),
  letterSpacing: cssValue(10),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
});

export const designTokenTypographySchema = z.object({
  fontFamilies: fontFamiliesSchema.optional(),
  styles: z
    .object({
      display: typographyStyleSchema.optional(),
      h1: typographyStyleSchema.optional(),
      h2: typographyStyleSchema.optional(),
      h3: typographyStyleSchema.optional(),
      h4: typographyStyleSchema.optional(),
      h5: typographyStyleSchema.optional(),
      h6: typographyStyleSchema.optional(),
      body: typographyStyleSchema.optional(),
      bodyLarge: typographyStyleSchema.optional(),
      bodySmall: typographyStyleSchema.optional(),
      caption: typographyStyleSchema.optional(),
      label: typographyStyleSchema.optional(),
      button: typographyStyleSchema.optional(),
      link: typographyStyleSchema.optional(),
    })
    .optional(),
});

export const designTokenSpacingSchema = z.object({
  xs: cssValue(20),
  sm: cssValue(20),
  md: cssValue(20),
  lg: cssValue(20),
  xl: cssValue(20),
  xxl: cssValue(20),
  xxxl: cssValue(20),
  xxxxl: cssValue(20),
});

export const designTokenContainerSchema = z.object({
  maxWidth: cssValue(),
  wideWidth: cssValue(),
  fullWidth: cssValue(),
  paddingX: cssValue(),
  sectionSpacing: cssValue(),
});

const buttonVariantSchema = z.object({
  background: hexColor(),
  text: hexColor(),
  border: hexColor(),
  hoverBackground: hexColor(),
  hoverText: hexColor(),
});

export const designTokenButtonsSchema = z.object({
  radius: cssValue(),
  height: cssValue(),
  paddingX: cssValue(),
  shadow: cssValue(),
  variants: z
    .object({
      primary: buttonVariantSchema.optional(),
      secondary: buttonVariantSchema.optional(),
      outline: buttonVariantSchema.optional(),
      ghost: buttonVariantSchema.optional(),
      destructive: buttonVariantSchema.optional(),
      link: buttonVariantSchema.optional(),
    })
    .optional(),
});

export const designTokenCardsSchema = z.object({
  background: hexColor(),
  border: hexColor(),
  radius: cssValue(),
  shadow: cssValue(),
  padding: cssValue(),
});

export const designTokenFormsSchema = z.object({
  inputHeight: cssValue(),
  inputRadius: cssValue(),
  inputBorder: hexColor(),
  inputBackground: hexColor(),
  labelColor: hexColor(),
  placeholderColor: hexColor(),
  focusColor: hexColor(),
  errorColor: hexColor(),
  helperColor: hexColor(),
});

export const designTokenBackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'image']).optional(),
  value: z.string().max(2000).optional().or(z.literal('')),
});

export const designTokenHeaderSchema = z.object({
  logoMediaId: z.string().max(2000).optional().or(z.literal('')),
  menuId: z.string().optional().or(z.literal('')),
  sticky: z.boolean().optional(),
  height: cssValue(),
  background: hexColor(),
  textColor: hexColor(),
  showBorder: z.boolean().optional(),
  showShadow: z.boolean().optional(),
  showCta: z.boolean().optional(),
  ctaLabel: z.string().max(100).optional().or(z.literal('')),
  ctaHref: z.string().max(2000).optional().or(z.literal('')),
});

export const designTokenFooterSchema = z.object({
  logoMediaId: z.string().max(2000).optional().or(z.literal('')),
  menuId: z.string().optional().or(z.literal('')),
  background: hexColor(),
  textColor: hexColor(),
  showNewsletter: z.boolean().optional(),
  contactInfo: z.string().max(500).optional().or(z.literal('')),
  copyrightText: z.string().max(300).optional().or(z.literal('')),
  socialLinks: z
    .array(
      z.object({ platform: z.string().max(50).optional(), href: z.string().max(2000).optional() })
    )
    .optional(),
});

const responsiveOverrideSchema = z.object({
  containerPaddingX: cssValue(),
  typographyScale: cssValue(10),
});

export const designTokenResponsiveSchema = z.object({
  tablet: responsiveOverrideSchema.optional(),
  mobile: responsiveOverrideSchema.optional(),
});

/**
 * The full Site Design Token form schema — mirrors `DesignTokensDto`
 * (backend) group-for-group. Every field optional at every level: the
 * Site Design editor only ever sends the groups the user actually
 * touched, and a brand-new theme (or a preset that doesn't set every
 * field) is a perfectly valid, partially-populated document.
 */
export const designTokensSchema = z.object({
  version: z.number().optional(),
  preset: z.string().max(100).optional(),
  colors: designTokenColorsSchema.optional(),
  typography: designTokenTypographySchema.optional(),
  spacing: designTokenSpacingSchema.optional(),
  container: designTokenContainerSchema.optional(),
  buttons: designTokenButtonsSchema.optional(),
  cards: designTokenCardsSchema.optional(),
  forms: designTokenFormsSchema.optional(),
  background: designTokenBackgroundSchema.optional(),
  header: designTokenHeaderSchema.optional(),
  footer: designTokenFooterSchema.optional(),
  responsive: designTokenResponsiveSchema.optional(),
});

export type DesignTokensFormValues = z.infer<typeof designTokensSchema>;
