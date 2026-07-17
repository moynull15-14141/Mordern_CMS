import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { Column } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

/** Click-to-sort column header — docs/59_FRONTEND_CODING_GUIDELINES.md
 * "Table System — Sorting": "an unsupported column is simply not sortable
 * (no header click handler attached)" — a column that doesn't call
 * `column.getCanSort()` true simply renders as plain text via the caller
 * never wrapping it in this component. */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('-ml-3 h-8 gap-1.5', className)}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {title}
      {sorted === 'asc' ? (
        <ArrowUp className="size-3.5" aria-hidden="true" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="size-3.5" aria-hidden="true" />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
      )}
    </Button>
  );
}
