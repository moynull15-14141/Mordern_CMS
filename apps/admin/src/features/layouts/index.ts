/** Public surface for the Layouts feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` actually needs. */
export { LayoutTable } from './components/layout-table';
export { LayoutFilters, type LayoutFiltersValue } from './components/layout-filters';
export { CreateLayoutForm, EditLayoutForm } from './components/layout-form';
export { StatusBadge } from './components/status-badge';
export { ThemeSelect } from './components/theme-select';
export { LayoutSelect } from './components/layout-select';
export { DeleteDialog } from './components/delete-dialog';
export { RestoreDialog } from './components/restore-dialog';
export { AssignLayoutDialog } from './components/assign-layout-dialog';
export { AssignmentEntityPicker } from './components/assignment-entity-picker';
export { AssignmentsTable } from './components/assignments-table';

// Page-level compositions — the only things `app/` actually imports.
export { LayoutsPageContent } from './components/layouts-page-content';
export { CreateLayoutPageContent } from './components/create-layout-page-content';
export { LayoutDetailPageContent } from './components/layout-detail-page-content';
export { EditLayoutPageContent } from './components/edit-layout-page-content';
export { AssignmentsPageContent } from './components/assignments-page-content';

export { useLayouts } from './hooks/use-layouts';
export { useLayout } from './hooks/use-layout';
export { useCreateLayout } from './hooks/use-create-layout';
export { useUpdateLayout } from './hooks/use-update-layout';
export { useDeleteLayout } from './hooks/use-delete-layout';
export { useRestoreLayout } from './hooks/use-restore-layout';
export { useLayoutAssignments } from './hooks/use-layout-assignments';
export { useAssignLayout } from './hooks/use-assign-layout';
export { useUnassignLayout } from './hooks/use-unassign-layout';

export type {
  Layout,
  LayoutFilters as LayoutFiltersType,
  LayoutStatus,
  LayoutPresetName,
  CreateLayoutInput,
  UpdateLayoutInput,
} from './types/layout';
export type {
  LayoutAssignment,
  LayoutAssignmentContentType,
  AssignLayoutInput,
} from './types/layout-assignment';
