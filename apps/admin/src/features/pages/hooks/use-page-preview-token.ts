'use client';

import { useMutation } from '@tanstack/react-query';
import { pagesApi } from '../services/pages.api';

/** `POST /pages/:id/preview-token` — mints a short-lived (10 minute)
 * token consumed by `apps/web`'s `/preview/pages/[token]` route. Not
 * cached/invalidated like the other page mutations: a fresh token is
 * minted every time Preview is clicked, and there's nothing else in the
 * app whose cache would ever need to reflect it. */
export function useCreatePagePreviewToken() {
  return useMutation({
    mutationFn: (id: string) => pagesApi.createPreviewToken(id),
  });
}
