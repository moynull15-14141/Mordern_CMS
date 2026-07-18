/** Public surface for the Categories feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` actually needs. */
export { CategoryTable } from './components/category-table';
export { CategoryTree } from './components/category-tree';
export { CategoryFilters, type CategoryFiltersValue } from './components/category-filters';
export { CreateCategoryForm, EditCategoryForm } from './components/category-form';
export { StatusBadge } from './components/status-badge';
export { ParentCategorySelect } from './components/parent-category-select';
export { DeleteDialog } from './components/delete-dialog';
export { RestoreDialog } from './components/restore-dialog';
export { MoveCategoryDialog } from './components/move-category-dialog';

// Page-level compositions — the only things `app/` actually imports.
export { CategoriesPageContent } from './components/categories-page-content';
export { CreateCategoryPageContent } from './components/create-category-page-content';
export { CategoryDetailPageContent } from './components/category-detail-page-content';
export { EditCategoryPageContent } from './components/edit-category-page-content';

export { useCategories } from './hooks/use-categories';
export { useCategoryTree } from './hooks/use-category-tree';
export { useCategoryFlat } from './hooks/use-category-flat';
export { useCategory } from './hooks/use-category';
export { useCreateCategory } from './hooks/use-create-category';
export { useUpdateCategory } from './hooks/use-update-category';
export { useMoveCategory } from './hooks/use-move-category';
export { useDeleteCategory } from './hooks/use-delete-category';
export { useRestoreCategory } from './hooks/use-restore-category';

export type {
  Category,
  CategoryTreeNode,
  CategoryStatus,
  CategoryFilters as CategoryFiltersType,
  CreateCategoryInput,
  UpdateCategoryInput,
  MoveCategoryInput,
} from './types/category';
