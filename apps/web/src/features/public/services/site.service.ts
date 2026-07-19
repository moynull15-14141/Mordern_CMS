import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import type { PublicSite } from '../types/site.types';
import { publicFetch } from './public-fetch.service';

/**
 * Real endpoint: `GET /public/site`
 * (`apps/backend/src/modules/site/controllers/public-site.controller.ts`,
 * Milestone 13.2). Wrapped in React's `cache()` — see
 * `theme.service.ts`'s doc comment for why.
 */
export const getCurrentSite = cache(async (): Promise<PublicSite> => {
  return publicFetch<PublicSite>(PUBLIC_API_ROUTES.SITE);
});
