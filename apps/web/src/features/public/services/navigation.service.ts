import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import type { PublicMenu } from '../types/navigation.types';
import { publicFetch } from './public-fetch.service';
import { PublicApiError } from '../utils/errors';

/**
 * Real endpoints: `GET /public/menus/:location` / `GET /public/menus/slug/:slug`
 * (`apps/backend/src/modules/menus/controllers/public-menus.controller.ts`).
 * Wrapped in React's `cache()` — see `theme.service.ts`'s doc comment for
 * why.
 *
 * The backend throws a 404 (`MenuNotFoundException`) when no published
 * menu exists for the location/slug yet — a legitimate site state, so it
 * resolves to `null` here rather than throwing.
 */
export const getMenuByLocation = cache(async (location: string): Promise<PublicMenu | null> => {
  try {
    return await publicFetch<PublicMenu>(PUBLIC_API_ROUTES.MENU_BY_LOCATION(location));
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
});

export const getMenuBySlug = cache(async (slug: string): Promise<PublicMenu | null> => {
  try {
    return await publicFetch<PublicMenu>(PUBLIC_API_ROUTES.MENU_BY_SLUG(slug));
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
});
