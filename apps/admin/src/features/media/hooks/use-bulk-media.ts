'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { mediaBulkApi, type BulkActionResult } from '../services/media-bulk.api';
import { mediaKeys } from './query-keys';

function summarize(result: BulkActionResult, verb: string): string {
  if (result.failed.length === 0) {
    return `${result.succeeded.length} asset${result.succeeded.length === 1 ? '' : 's'} ${verb}.`;
  }
  return `${result.succeeded.length} ${verb}, ${result.failed.length} failed.`;
}

function useBulkAction(action: (ids: string[]) => Promise<BulkActionResult>, verb: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      if (result.failed.length === 0) {
        toast.success(summarize(result, verb));
      } else {
        toast.error(summarize(result, verb));
      }
    },
  });
}

export function useBulkMoveMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, folderId }: { ids: string[]; folderId?: string }) =>
      mediaBulkApi.move(ids, folderId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      if (result.failed.length === 0) {
        toast.success(summarize(result, 'moved'));
      } else {
        toast.error(summarize(result, 'moved'));
      }
    },
  });
}

export function useBulkArchiveMedia() {
  return useBulkAction((ids) => mediaBulkApi.archive(ids), 'archived');
}

export function useBulkUnarchiveMedia() {
  return useBulkAction((ids) => mediaBulkApi.unarchive(ids), 'unarchived');
}

export function useBulkRestoreMedia() {
  return useBulkAction((ids) => mediaBulkApi.restore(ids), 'restored');
}

export function useBulkDeleteMedia() {
  return useBulkAction((ids) => mediaBulkApi.remove(ids), 'deleted');
}

export function usePermanentDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaBulkApi.permanentDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success('Permanently deleted.');
    },
  });
}
