import type { Table } from '@tanstack/react-table';
import { SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { SearchInput } from '@/components/layout/search-input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Filter/bulk-action controls a feature module supplies — foundation
   * only renders the slot, no module-specific filter is defined here. */
  filters?: ReactNode;
  actions?: ReactNode;
}

/** docs/59_FRONTEND_CODING_GUIDELINES.md "Table System" — Search +
 * Column Visibility + a slot for feature-supplied Column Filters/Bulk
 * Actions. */
export function DataTableToolbar<TData>({
  table,
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        {onSearchChange ? (
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="max-w-xs"
          />
        ) : null}
        {filters}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                  onSelect={(event) => event.preventDefault()}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
