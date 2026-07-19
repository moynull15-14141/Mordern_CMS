/**
 * Mirrors `PublicThemeResponseDto`
 * (`apps/backend/src/modules/themes/dto/public-theme-response.dto.ts`)
 * field-for-field — the real, live response shape of `GET /public/theme`.
 * No field is invented; nothing here may drift from that DTO without a
 * corresponding backend change.
 */
export interface PublicThemeColors {
  primary: string | null;
  secondary: string | null;
}

export interface PublicThemeLayout {
  header: string | null;
  footer: string | null;
  containerWidth: string | null;
  borderRadius: string | null;
  buttonStyle: string | null;
  homepage: string | null;
  blog: string | null;
}

export interface PublicTheme {
  id: string;
  name: string;
  slug: string;
  version: string | null;
  logo: string | null;
  favicon: string | null;
  colors: PublicThemeColors;
  typography: Record<string, unknown> | null;
  layout: PublicThemeLayout;
  customCss: string | null;
  customJs: string | null;
}
