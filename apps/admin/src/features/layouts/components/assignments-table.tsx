'use client';

import { MoreHorizontal } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLayouts } from '../hooks/use-layouts';
import { usePages } from '@/features/pages';
import { useArticles } from '@/features/articles';
import { useCategoryFlat } from '@/features/categories';
import { CONTENT_TYPE_LABELS } from '../constants/layout-assignment.constants';
import type { LayoutAssignment } from '../types/layout-assignment';

export interface AssignmentsTableProps {
  data: LayoutAssignment[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onUnassign: (assignment: LayoutAssignment) => void;
}

function targetLabel(
  assignment: LayoutAssignment,
  lookups: {
    pages: Map<string, string>;
    articles: Map<string, string>;
    categories: Map<string, string>;
  }
): string {
  if (assignment.contentType === 'HOMEPAGE') return 'The homepage';
  const id = assignment.pageId ?? assignment.articleId ?? assignment.categoryId;
  if (!id) return `Default for every ${assignment.contentType.toLowerCase()}`;

  const map =
    assignment.contentType === 'PAGE'
      ? lookups.pages
      : assignment.contentType === 'ARTICLE'
        ? lookups.articles
        : lookups.categories;
  return map.get(id) ?? id;
}

/**
 * Global Layout Assignments table — resolves `layoutId`/`pageId`/
 * `articleId`/`categoryId` to a human-readable name client-side (no batch
 * "get by ids" endpoint exists on any of these controllers) by fetching
 * one reasonably-sized page of each real list endpoint once; falls back
 * to the raw id for anything beyond that page (assignment/content counts
 * are expected to stay small enough this never matters in practice).
 *
 * No "Restore" action — unlike Layouts/Themes/Pages, there is no detail
 * route or `includeDeleted` escape hatch for one specific assignment
 * anywhere in this feature, and `GET /layout-assignments` itself never
 * returns a soft-deleted row, so a restore action here would have no way
 * to ever become reachable.
 */
export function AssignmentsTable({
  data,
  isLoading,
  error,
  onRetry,
  onUnassign,
}: AssignmentsTableProps) {
  const layoutsQuery = useLayouts({ page: 1, limit: 100 });
  const pagesQuery = usePages({ page: 1, limit: 100 });
  const articlesQuery = useArticles({ page: 1, limit: 100 });
  const categoriesQuery = useCategoryFlat();

  const layoutNames = new Map((layoutsQuery.data?.data ?? []).map((l) => [l.id, l.name]));
  const lookups = {
    pages: new Map((pagesQuery.data?.data ?? []).map((p) => [p.id, p.title])),
    articles: new Map((articlesQuery.data?.data ?? []).map((a) => [a.id, a.title])),
    categories: new Map((categoriesQuery.data ?? []).map((c) => [c.id, c.name])),
  };

  const columns: ColumnDef<LayoutAssignment, unknown>[] = [
    {
      id: 'layout',
      header: 'Layout',
      cell: ({ row }) => layoutNames.get(row.original.layoutId) ?? row.original.layoutId,
    },
    {
      id: 'contentType',
      header: 'Content type',
      cell: ({ row }) => (
        <Badge variant="outline">{CONTENT_TYPE_LABELS[row.original.contentType]}</Badge>
      ),
    },
    {
      id: 'target',
      header: 'Applies to',
      cell: ({ row }) => targetLabel(row.original, lookups),
    },
    {
      id: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const assignment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions">
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => onUnassign(assignment)}
                className="text-destructive"
              >
                Unassign
              </DropdownMenuItem>
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
      emptyTitle="No layout assignments yet"
      emptyDescription="Assign a layout to a page, article, category, or the homepage to get started."
      getRowId={(row) => row.id}
    />
  );
}
