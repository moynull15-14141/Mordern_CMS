/** Public surface for the Reusable Blocks feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` actually needs. */
export { ReusableBlockTable } from './components/reusable-block-table';
export {
  ReusableBlockFilters,
  type ReusableBlockFiltersValue,
} from './components/reusable-block-filters';
export { CreateReusableBlockForm, EditReusableBlockForm } from './components/reusable-block-form';
export { ReusableBlockPreview } from './components/reusable-block-preview';
export { UsageList } from './components/usage-list';
export { DeleteDialog } from './components/delete-dialog';
export { RestoreDialog } from './components/restore-dialog';
export { DuplicateDialog } from './components/duplicate-dialog';

// Page-level compositions — the only things `app/` actually imports.
export { ReusableBlocksPageContent } from './components/reusable-blocks-page-content';
export { CreateReusableBlockPageContent } from './components/create-reusable-block-page-content';
export { ReusableBlockDetailPageContent } from './components/reusable-block-detail-page-content';
export { EditReusableBlockPageContent } from './components/edit-reusable-block-page-content';

export { useReusableBlocks } from './hooks/use-reusable-blocks';
export { useReusableBlock } from './hooks/use-reusable-block';
export { useReusableBlockUsages } from './hooks/use-reusable-block-usages';
export { useCreateReusableBlock } from './hooks/use-create-reusable-block';
export { useUpdateReusableBlock } from './hooks/use-update-reusable-block';
export { useDeleteReusableBlock } from './hooks/use-delete-reusable-block';
export { useRestoreReusableBlock } from './hooks/use-restore-reusable-block';
export { useDuplicateReusableBlock } from './hooks/use-duplicate-reusable-block';

export type {
  ReusableBlock,
  ReusableBlockContentType,
  ReusableBlockFilters as ReusableBlockFiltersType,
  ReusableBlockSortField,
  ReusableBlockUsageReference,
  CreateReusableBlockInput,
  UpdateReusableBlockInput,
} from './types/reusable-block';
