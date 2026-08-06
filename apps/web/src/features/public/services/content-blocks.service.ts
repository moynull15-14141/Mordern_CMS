import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import { publicFetch } from './public-fetch.service';
import { PublicApiError } from '../utils/errors';
import type { PublicReusableBlock } from '../block-renderer/types/public-reusable-block.types';

/**
 * Real endpoint: `GET /public/content-blocks/reusable/:id`
 * (`apps/backend/src/modules/content-blocks/controllers/public-content-blocks.controller.ts`).
 *
 * Wrapped in React's `cache()` — the same request-level memoization every
 * other public service in this codebase uses (`theme.service.ts`'s
 * `getActiveTheme`, `navigation.service.ts`'s `getMenuByLocation`, etc.):
 * within one render pass, calling `getReusableBlock('x')` from more than
 * one `<ReusableBlockRenderer>` (the same reusable block inserted into
 * several places in one article, or referenced from both an article and
 * its layout chrome) resolves to a single deduplicated backend request,
 * not one per call site. `cache()` is keyed by argument identity, so two
 * different ids still fire two requests — that's the correct behavior,
 * not a gap: request-level caching avoids *repeated* fetches of the same
 * id, it is not a batch-fetch mechanism.
 *
 * A missing/deleted id resolves to `null` (the backend 404s — a legitimate
 * "this reference is dangling" state, not a rendering error) rather than
 * throwing, matching `getActiveTheme`/`getMenuByLocation`'s exact
 * precedent — `ReusableBlockRenderer` renders nothing for a `null` result.
 */
export const getReusableBlock = cache(async (id: string): Promise<PublicReusableBlock | null> => {
  try {
    return await publicFetch<PublicReusableBlock>(PUBLIC_API_ROUTES.REUSABLE_BLOCK_BY_ID(id));
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
});
