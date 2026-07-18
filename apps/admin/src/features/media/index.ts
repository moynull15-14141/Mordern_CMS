/** Public surface for the Media feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` (and other features, for
 * `MediaPickerDialog`) actually need. */
export { MediaTable } from './components/media-table';
export { MediaGrid } from './components/media-grid';
export { MediaFilters, type MediaFiltersValue } from './components/media-filters';
export { StatusBadge } from './components/status-badge';
export { MediaThumbnail } from './components/media-thumbnail';
export { CopyActions } from './components/copy-actions';
export { DeleteDialog } from './components/delete-dialog';
export { RestoreDialog } from './components/restore-dialog';
export { MediaPickerDialog } from './components/media-picker-dialog';

// Page-level compositions — the only things `app/` actually imports.
export { MediaListPageContent } from './components/media-list-page-content';
export { UploadPageContent } from './components/upload-page-content';
export { MediaDetailPageContent } from './components/media-detail-page-content';

export { useMediaList } from './hooks/use-media-list';
export { useMedia } from './hooks/use-media';
export { useMediaUsages } from './hooks/use-media-usages';
export { useMediaDuplicates } from './hooks/use-media-duplicates';
export { useCreateMedia } from './hooks/use-create-media';
export { useUpdateMedia } from './hooks/use-update-media';
export { useRenameMedia } from './hooks/use-rename-media';
export { useMoveMedia } from './hooks/use-move-media';
export { useDeleteMedia } from './hooks/use-delete-media';
export { useRestoreMedia } from './hooks/use-restore-media';
export { useMediaFolderTree } from './hooks/use-media-folder-tree';

export type {
  Media,
  MediaType,
  MediaStatus,
  MediaFilters as MediaFiltersType,
  CreateMediaAssetInput,
  UpdateMediaAssetInput,
} from './types/media';
