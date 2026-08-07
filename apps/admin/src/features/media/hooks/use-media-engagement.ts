'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mediaFavoritesApi } from '../services/media-favorites.api';
import { mediaEngagementKeys, mediaKeys } from './query-keys';

export function useFavoriteMediaList(enabled = true) {
  return useQuery({
    queryKey: mediaEngagementKeys.favorites(),
    queryFn: () => mediaFavoritesApi.listFavorites(),
    enabled,
  });
}

export function useRecentMediaList(enabled = true) {
  return useQuery({
    queryKey: mediaEngagementKeys.recent(),
    queryFn: () => mediaFavoritesApi.listRecent(),
    enabled,
  });
}

export function usePinnedMediaList(enabled = true) {
  return useQuery({
    queryKey: mediaEngagementKeys.pinned(),
    queryFn: () => mediaFavoritesApi.listPinned(),
    enabled,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaFavoritesApi.addFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaEngagementKeys.favorites() });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaFavoritesApi.removeFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaEngagementKeys.favorites() });
    },
  });
}

export function useRecordMediaView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaFavoritesApi.recordView(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaEngagementKeys.recent() });
    },
  });
}

export function usePinMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaFavoritesApi.pin(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: mediaEngagementKeys.pinned() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(id) });
    },
  });
}

export function useUnpinMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaFavoritesApi.unpin(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: mediaEngagementKeys.pinned() });
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(id) });
    },
  });
}
