import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../../constants/api-routes.constants';
import { publicFetch } from '../../services/public-fetch.service';
import type { PublicLayoutContentType, PublicLayoutResolutionResponse } from '../types';

/**
 * Real endpoint: `GET /public/layouts/resolve`
 * (`apps/backend/src/modules/layouts/controllers/public-layouts.controller.ts`,
 * Backend Milestone 14.1). Wrapped in React's `cache()`, keyed on the two
 * primitive arguments (not an object — the same `cache()`-argument-identity
 * reasoning `content-resolver.ts`/`load-blog-list-content.ts` already
 * document) so a route's `generateMetadata` and page component calling
 * this with the same `(contentType, slug)` dedupe to one request.
 */
export const getLayoutResolution = cache(
  async (
    contentType: PublicLayoutContentType,
    slug?: string
  ): Promise<PublicLayoutResolutionResponse> => {
    return publicFetch<PublicLayoutResolutionResponse>(
      PUBLIC_API_ROUTES.LAYOUT_RESOLVE(contentType, slug)
    );
  }
);
