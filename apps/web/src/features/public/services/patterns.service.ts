import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import { publicFetch } from './public-fetch.service';
import { PublicApiError } from '../utils/errors';
import type { PublicPattern } from '../block-renderer/types/public-pattern.types';

/**
 * Real endpoint: `GET /public/patterns/:id`
 * (`apps/backend/src/modules/patterns/controllers/public-patterns.controller.ts`).
 * Used only by the admin preview iframe (`/preview/patterns/[id]`) — no
 * other route links here. `cache()`-wrapped and "404 → null" for the same
 * reasons as `getReusableBlock` (see that file's doc comment).
 */
export const getPattern = cache(async (id: string): Promise<PublicPattern | null> => {
  try {
    return await publicFetch<PublicPattern>(PUBLIC_API_ROUTES.PATTERN_BY_ID(id));
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
});
