'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patternsApi } from '../services/patterns.api';
import { patternsKeys } from './query-keys';
import type { CreatePatternInput, Pattern } from '../types/pattern';

/** `POST /patterns` from inside the Block Editor's "Save as pattern" flow
 * (`components/save-as-pattern-dialog.tsx`, opened from the block-editor
 * feature's property panel). Invalidates the Pattern Library's own list
 * query so the just-saved pattern shows up immediately — mirrors
 * `useCreateReusableBlockFromEditor` exactly. Does not toast itself; the
 * calling dialog owns success/error messaging since it also needs the
 * created pattern for its own follow-up (closing the dialog). */
export function useCreatePatternFromEditor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePatternInput): Promise<Pattern> => patternsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.lists() });
    },
  });
}
