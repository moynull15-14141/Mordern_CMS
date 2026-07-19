import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import type { PublicSetting } from '../types/settings.types';
import { publicFetch } from './public-fetch.service';

/**
 * Real endpoint: `GET /public/settings`
 * (`apps/backend/src/modules/settings/controllers/public-settings.controller.ts`,
 * Milestone 13.2) — returns only the closed, backend-side allowlist
 * (`PUBLIC_SETTING_KEYS`); this function returns whatever that list
 * contains as-is, never assuming a specific key is present. Wrapped in
 * React's `cache()` so `layout.tsx` and every page's `load-render-context.ts`
 * call dedupe to one request per render (see `theme.service.ts`'s doc
 * comment for the same reasoning).
 */
export const getPublicSettings = cache(async (): Promise<PublicSetting[]> => {
  return publicFetch<PublicSetting[]>(PUBLIC_API_ROUTES.SETTINGS);
});
