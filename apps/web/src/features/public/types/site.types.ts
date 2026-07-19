/**
 * Mirrors `PublicSiteResponseDto`
 * (`apps/backend/src/modules/site/dto/public-site-response.dto.ts`)
 * field-for-field — the real, live response shape of `GET /public/site`.
 */
export interface PublicSiteActiveTheme {
  id: string;
  name: string;
  slug: string;
}

export interface PublicSite {
  name: string;
  locale: string | null;
  timezone: string | null;
  activeTheme: PublicSiteActiveTheme | null;
}
