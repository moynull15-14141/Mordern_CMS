'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patternsApi } from '../services/patterns.api';
import { patternsKeys } from './query-keys';

/** Server-persisted, per-user favorites — mirrors `useFavoriteMediaList`
 * exactly (Milestone 5's established favorite architecture, reused here
 * rather than inventing a second mechanism). */
export function useFavoritePatterns() {
  return useQuery({
    queryKey: patternsKeys.favorites(),
    queryFn: () => patternsApi.listFavorites(),
  });
}

export function useAddPatternFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patternsApi.addFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.favorites() });
    },
  });
}

export function useRemovePatternFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patternsApi.removeFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patternsKeys.favorites() });
    },
  });
}
