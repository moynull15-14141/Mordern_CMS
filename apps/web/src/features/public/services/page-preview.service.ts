import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import { publicFetch } from './public-fetch.service';
import { PublicApiError } from '../utils/errors';

/** Mirrors `PublicPageResponseDto` — the admin Preview button's target
 * shape, any status (not published-only, unlike `getPageBySlug`). */
export interface PublicPagePreview {
  title: string;
  slug: string;
  body: unknown;
  publishedAt: string | null;
  seo: unknown;
}

/**
 * Real endpoint: `GET /public/pages/preview/:token`
 * (`apps/backend/src/modules/pages/controllers/public-pages.controller.ts`).
 * Used only by the admin Page Builder's Preview button (Milestone 7) — the
 * token itself is the short-lived credential (see
 * `PagePreviewService`'s doc comment on the backend), so this route
 * resolves DRAFT/REVIEW content that `getPageBySlug` would 404 on.
 * `cache()`-wrapped and "invalid/expired → null" for the same reasons as
 * `getReusableBlock`/`getPattern`.
 */
export const getPageForPreview = cache(async (token: string): Promise<PublicPagePreview | null> => {
  try {
    return await publicFetch<PublicPagePreview>(PUBLIC_API_ROUTES.PAGE_PREVIEW_BY_TOKEN(token));
  } catch (error) {
    if (error instanceof PublicApiError && (error.status === 404 || error.status === 401)) {
      return null;
    }
    throw error;
  }
});
