/** Public surface for the Tags feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` actually needs. */
export { TagTable } from './components/tag-table';
export { CreateTagForm, EditTagForm } from './components/tag-form';
export { DeleteDialog } from './components/delete-dialog';
export { RestoreDialog } from './components/restore-dialog';

// Page-level compositions — the only things `app/` actually imports.
export { TagsPageContent } from './components/tags-page-content';
export { CreateTagPageContent } from './components/create-tag-page-content';
export { TagDetailPageContent } from './components/tag-detail-page-content';
export { EditTagPageContent } from './components/edit-tag-page-content';

export { useTags } from './hooks/use-tags';
export { useTag } from './hooks/use-tag';
export { useCreateTag } from './hooks/use-create-tag';
export { useUpdateTag } from './hooks/use-update-tag';
export { useDeleteTag } from './hooks/use-delete-tag';
export { useRestoreTag } from './hooks/use-restore-tag';

export type { Tag, TagFilters as TagFiltersType, CreateTagInput, UpdateTagInput } from './types/tag';
