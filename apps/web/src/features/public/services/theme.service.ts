import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import type { PublicTheme } from '../types/theme.types';
import { publicFetch } from './public-fetch.service';
import { PublicApiError } from '../utils/errors';

/**
 * Real endpoint: `GET /public/theme`
 * (`apps/backend/src/modules/themes/controllers/public-themes.controller.ts`).
 * Wrapped in React's `cache()` so multiple call sites within one render
 * (e.g. `PublicContentProvider` and a future `<head>` metadata builder)
 * dedupe to a single request — the milestone brief's "cache requests".
 *
 * The backend throws a 404 (`NoActiveThemeException`) when no theme is
 * active yet — a legitimate site state (nothing published/activated),
 * not a failure, so it resolves to `null` here rather than throwing.
 */
export const getActiveTheme = cache(async (): Promise<PublicTheme | null> => {
  try {
    return await publicFetch<PublicTheme>(PUBLIC_API_ROUTES.THEME);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
});
