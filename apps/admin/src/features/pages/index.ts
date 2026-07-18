/** Public surface for the Pages feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` actually needs. */
export { PageTable } from './components/page-table';
export { PageFilters, type PageFiltersValue } from './components/page-filters';
export { CreatePageForm, EditPageForm } from './components/page-form';
export { StatusBadge } from './components/status-badge';
export { DeleteDialog } from './components/delete-dialog';
export { RestoreDialog } from './components/restore-dialog';
export { PublishDialog } from './components/publish-dialog';

// Page-level compositions — the only things `app/` actually imports.
export { PagesPageContent } from './components/pages-page-content';
export { CreatePagePageContent } from './components/create-page-page-content';
export { PageDetailPageContent } from './components/page-detail-page-content';
export { EditPagePageContent } from './components/edit-page-page-content';

export { usePages } from './hooks/use-pages';
export { usePage } from './hooks/use-page';
export { useCreatePage } from './hooks/use-create-page';
export { useUpdatePage } from './hooks/use-update-page';
export { useDeletePage } from './hooks/use-delete-page';
export { useRestorePage } from './hooks/use-restore-page';
export { usePublishPage } from './hooks/use-publish-page';

export type {
  Page,
  PageFilters as PageFiltersType,
  ContentStatus,
  CreatePageInput,
  UpdatePageInput,
} from './types/page';
