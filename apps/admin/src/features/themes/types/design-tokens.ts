/**
 * Mirrors `DesignTokensDto` (`apps/backend/src/modules/themes/dto/design-tokens.dto.ts`)
 * field-for-field — the Site Design Token model (Milestone 8). Lives at
 * `Theme.settings.designTokens`, wholly optional at every level: a
 * pre-M8 theme simply has none, and a M8 theme only sets whichever
 * groups the site owner actually configured in the Site Design editor.
 */
export interface DesignTokenTypographyStyle {
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export type TypographyStyleKey =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button'
  | 'link';

export type ButtonVariantKey =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';

export interface DesignTokens {
  version?: number;
  preset?: string;
  colors?: {
    brand?: { primary?: string; secondary?: string; accent?: string };
    background?: {
      page?: string;
      surface?: string;
      surfaceElevated?: string;
      section?: string;
      inverse?: string;
    };
    text?: {
      primary?: string;
      secondary?: string;
      muted?: string;
      inverse?: string;
      link?: string;
    };
    border?: { default?: string; strong?: string; focus?: string };
    status?: { success?: string; warning?: string; error?: string; info?: string };
  };
  typography?: {
    fontFamilies?: { heading?: string; body?: string; ui?: string; mono?: string };
    styles?: Partial<Record<TypographyStyleKey, DesignTokenTypographyStyle>>;
  };
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    xxl?: string;
    xxxl?: string;
    xxxxl?: string;
  };
  container?: {
    maxWidth?: string;
    wideWidth?: string;
    fullWidth?: string;
    paddingX?: string;
    sectionSpacing?: string;
  };
  buttons?: {
    radius?: string;
    height?: string;
    paddingX?: string;
    shadow?: string;
    variants?: Partial<
      Record<
        ButtonVariantKey,
        {
          background?: string;
          text?: string;
          border?: string;
          hoverBackground?: string;
          hoverText?: string;
        }
      >
    >;
  };
  cards?: {
    background?: string;
    border?: string;
    radius?: string;
    shadow?: string;
    padding?: string;
  };
  forms?: {
    inputHeight?: string;
    inputRadius?: string;
    inputBorder?: string;
    inputBackground?: string;
    labelColor?: string;
    placeholderColor?: string;
    focusColor?: string;
    errorColor?: string;
    helperColor?: string;
  };
  background?: { type?: 'solid' | 'gradient' | 'image'; value?: string };
  header?: {
    logoMediaId?: string;
    menuId?: string;
    sticky?: boolean;
    height?: string;
    background?: string;
    textColor?: string;
    showBorder?: boolean;
    showShadow?: boolean;
    showCta?: boolean;
    ctaLabel?: string;
    ctaHref?: string;
  };
  footer?: {
    logoMediaId?: string;
    menuId?: string;
    background?: string;
    textColor?: string;
    showNewsletter?: boolean;
    contactInfo?: string;
    copyrightText?: string;
    socialLinks?: { platform?: string; href?: string }[];
  };
  responsive?: {
    tablet?: { containerPaddingX?: string; typographyScale?: string };
    mobile?: { containerPaddingX?: string; typographyScale?: string };
  };
}
