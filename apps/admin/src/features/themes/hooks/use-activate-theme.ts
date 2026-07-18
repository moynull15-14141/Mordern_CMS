'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { themesApi } from '../services/themes.api';
import { themesKeys } from './query-keys';

/** `POST /themes/:id/activate` — `theme.manage`-gated. Automatically
 * deactivates the site's previous active theme server-side (see
 * docs/72_BACKEND_THEMES.md "Activation Flow") — invalidating the list
 * and active-theme queries is what surfaces that side effect here,
 * without the frontend re-implementing the deactivation itself. */
export function useActivateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => themesApi.activate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: themesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: themesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: themesKeys.active() });
      toast.success('Theme activated.');
    },
  });
}
