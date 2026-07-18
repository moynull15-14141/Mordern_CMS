'use client';

import { MoreHorizontal } from 'lucide-react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type { PaginationMeta } from '@/types/api';
import { SettingValueDisplay } from './setting-value-display';
import { SETTING_CATEGORY_LABELS } from '../constants/settings.constants';
import type { Setting } from '../types/settings';

export interface SettingsTableProps {
  data: Setting[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  search: string;
  onSearchChange: (value: string) => void;
  filters?: React.ReactNode;
  onView: (setting: Setting) => void;
  onEdit: (setting: Setting) => void;
}

/**
 * Settings List — no `GET /settings` query params exist for search/filter/
 * sort/pagination (docs/64_FRONTEND_SETTINGS.md "Conflicts Discovered"), so
 * unlike `UserTable`, every one of `data`/`sorting`/`pagination` here is
 * pre-computed client-side by the caller (`SettingsPageContent`) over the
 * complete, already-fetched 34-entry catalog — this component only renders
 * whatever page/sort/filter state it's handed. "Edit" always navigates to
 * that setting's category page (`/settings/[category]`) — there is no
 * single-setting edit route; the category page bulk-saves via
 * `CategorySettingsForm`.
 */
export function SettingsTable({
  data,
  isLoading,
  error,
  onRetry,
  pagination,
  onPageChange,
  onLimitChange,
  sorting,
  onSortingChange,
  search,
  onSearchChange,
  filters,
  onView,
  onEdit,
}: SettingsTableProps) {
  const columns: ColumnDef<Setting, unknown>[] = [
    {
      id: 'label',
      accessorKey: 'label',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Label" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.label}</div>
          <div className="font-mono text-xs text-muted-foreground">{row.original.key}</div>
        </div>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
      cell: ({ row }) => <Badge variant="secondary">{SETTING_CATEGORY_LABELS[row.original.category]}</Badge>,
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
    },
    {
      id: 'value',
      header: () => 'Value',
      enableSorting: false,
      cell: ({ row }) => <SettingValueDisplay setting={row.original} />,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const setting = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${setting.label}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onView(setting)}>View details</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit(setting)}>Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No settings match your filters"
      emptyDescription="Try a different search term or category."
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by key or label…"
      filters={filters}
      getRowId={(row) => row.key}
    />
  );
}
