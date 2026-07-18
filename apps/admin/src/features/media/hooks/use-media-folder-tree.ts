'use client';

import { useQuery } from '@tanstack/react-query';
import { mediaFoldersApi } from '../services/media-folders.api';
import { mediaFolderKeys } from './query-keys';

/** `GET /media-folders/tree` — powers the List's folder filter and the
 * Move-to-folder dialog's folder selector. */
export function useMediaFolderTree() {
  return useQuery({
    queryKey: mediaFolderKeys.tree(),
    queryFn: () => mediaFoldersApi.getTree(),
  });
}
