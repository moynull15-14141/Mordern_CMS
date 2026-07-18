'use client';

import { useMutation } from '@tanstack/react-query';
import { seoApi } from '../services/seo.api';

/** `POST /seo/preview` — stateless. Resolves the same title/description/
 * image fallback chain (Settings defaults, OG->Twitter image fallback)
 * the public site uses, so the Google/Facebook/Twitter preview cards show
 * exactly what would actually render rather than a frontend guess. */
export function useSeoPreview() {
  return useMutation({ mutationFn: seoApi.preview });
}
