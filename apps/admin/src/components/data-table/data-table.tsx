'use client';

import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { PaginationMeta, SortOrder } from '@/types/api';

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;

  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;

  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;

  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;

  filters?: React.ReactNode;
  toolbarActions?: React.ReactNode;

  getRowId?: (row: TData) => string;
}

/**
 * Universal DataTable — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Table
 * System": one component used by every future list view. Foundation only
 * — no module-specific `columns` are defined in this file; every feature
 * supplies its own `ColumnDef<TData>[]`. Sorting/pagination/search are all
 * controlled (server-driven) — this component never re-sorts/re-paginates
 * client-side data that the server already paginated.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading,
  error,
  onRetry,
  emptyTitle = 'No results',
  emptyDescription,
  pagination,
  onPageChange,
  onLimitChange,
  sorting,
  onSortingChange,
  search,
  onSearchChange,
  searchPlaceholder,
  rowSelection,
  onRowSelectionChange,
  filters,
  toolbarActions,
  getRowId,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // TanStack Table's API shape (mutable table instance methods) is flagged
  // by the React Compiler's static analysis as memoization-incompatible —
  // informational only, not a bug; @tanstack/react-table is an approved
  // Frontend Milestone 1 dependency.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    // rowSelection must never be `undefined` here — as a controlled state
    // slot, TanStack Table skips its own internal `{}` default and crashes
    // on row.getIsSelected() the moment any row renders.
    state: { sorting, rowSelection: rowSelection ?? {}, columnVisibility },
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (updater) => {
      if (!onSortingChange) return;
      const next = typeof updater === 'function' ? updater(sorting ?? []) : updater;
      onSortingChange(next);
    },
    onRowSelectionChange: (updater) => {
      if (!onRowSelectionChange) return;
      const next = typeof updater === 'function' ? updater(rowSelection ?? {}) : updater;
      onRowSelectionChange(next);
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId as (row: TData) => string,
    enableRowSelection: Boolean(onRowSelectionChange),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        actions={toolbarActions}
      />

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_column, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <ErrorState error={error} onRetry={onRetry} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && onPageChange && onLimitChange ? (
        <DataTablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      ) : null}
    </div>
  );
}

/** Standard selection-checkbox column — a feature spreads this into its
 * own `columns` array (e.g. `[selectionColumn, ...myColumns]`) rather than
 * this file hand-rendering one; matches docs/59 "Bulk Action" (row-selection
 * checkboxes). Exported here since it's identical for every table, not
 * feature-specific. */
export function createSelectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        aria-label="Select all rows"
        checked={table.getIsAllRowsSelected()}
        ref={(el) => {
          if (el) el.indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="size-4 rounded-sm border-input"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label="Select row"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="size-4 rounded-sm border-input"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

export type { SortOrder };
