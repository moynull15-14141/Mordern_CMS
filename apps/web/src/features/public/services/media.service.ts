import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import { publicFetch } from './public-fetch.service';
import { PublicApiError } from '../utils/errors';
import type { PublicMedia } from '../block-renderer/types/public-media.types';

/**
 * Real endpoint: `GET /public/media/:id`
 * (`apps/backend/src/modules/media/controllers/public-media.controller.ts`).
 * `cache()`-wrapped, same request-level dedup pattern as
 * `content-blocks.service.ts`'s `getReusableBlock` — deduplicates repeated
 * fetches of the *same* `mediaId` within one render pass (e.g. the same
 * image referenced from two blocks), not a batch-fetch mechanism.
 *
 * A missing/private/non-READY id resolves to `null` (the backend 404s)
 * rather than throwing, matching `getReusableBlock`'s exact precedent —
 * block components render their legacy `data.url` fallback (or nothing)
 * for a `null` result.
 */
export const getMedia = cache(async (id: string): Promise<PublicMedia | null> => {
  try {
    return await publicFetch<PublicMedia>(PUBLIC_API_ROUTES.MEDIA_BY_ID(id));
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
});
