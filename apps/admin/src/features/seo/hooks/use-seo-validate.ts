'use client';

import { useMutation } from '@tanstack/react-query';
import { seoApi } from '../services/seo.api';

/** `POST /seo/validate` — stateless, no persistence, no cache key.
 * Called on-demand (debounced) as the editor form changes, driving the
 * live Issue List / Health Panel. */
export function useSeoValidate() {
  return useMutation({ mutationFn: seoApi.validate });
}
