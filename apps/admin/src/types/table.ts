import type {
  ColumnDef,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import type { PaginationMeta, SortOrder } from './api';

/** DataTable foundation types — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md
 * "Table System". No module-specific column is defined here (foundation
 * only) — feature modules supply their own `ColumnDef<TData>[]`. */
export type { ColumnDef, RowSelectionState, SortingState, VisibilityState };

export interface DataTableState {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
}

export interface DataTablePaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}
