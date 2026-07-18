'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { PermissionGate } from '@/components/guards/permission-gate';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { PERMISSIONS } from '@/constants/permissions';
import { CATEGORY_ROUTES } from '@/constants/routes';
import { useCategory } from '../hooks/use-category';
import { useCategoryBreadcrumb } from '../hooks/use-category-breadcrumb';
import { useCategoryChildren } from '../hooks/use-category-children';
import { useDeleteCategory } from '../hooks/use-delete-category';
import { useRestoreCategory } from '../hooks/use-restore-category';
import { useMoveCategory } from '../hooks/use-move-category';
import { StatusBadge } from './status-badge';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { MoveCategoryDialog } from './move-category-dialog';

export interface CategoryDetailPageContentProps {
  categoryId: string;
}

/** Category Details — metadata, breadcrumb, SEO, and direct children. Move
 * is a separate, dedicated action (`POST /:id/move`) — never bundled into
 * the Edit form (matching the backend's own `PATCH`/`POST /move` split). */
export function CategoryDetailPageContent({ categoryId }: CategoryDetailPageContentProps) {
  const router = useRouter();
  const { data: category, isLoading, error, refetch } = useCategory(categoryId);
  const { data: breadcrumb } = useCategoryBreadcrumb(categoryId);
  const { data: children, isLoading: childrenLoading, error: childrenError } = useCategoryChildren(categoryId);

  const deleteMutation = useDeleteCategory();
  const restoreMutation = useRestoreCategory();
  const moveMutation = useMoveCategory();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!category) {
    return <EmptyState title="Category not found" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={category.name}
        description={breadcrumb?.map((item) => item.name).join(' / ')}
        actions={
          <div className="flex flex-wrap gap-2">
            {category.deletedAt ? (
              <PermissionGate permissions={PERMISSIONS.CATEGORY_CREATE}>
                <Button variant="outline" onClick={() => setRestoreOpen(true)}>
                  Restore
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permissions={PERMISSIONS.CATEGORY_CREATE}>
                <Button variant="outline" onClick={() => router.push(CATEGORY_ROUTES.edit(category.id))}>
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setMoveOpen(true)}>
                  Move
                </Button>
                <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                  Delete
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CardTitle>{category.name}</CardTitle>
          <StatusBadge status={category.status} />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-mono">{category.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Sort order</dt>
              <dd>{category.sortOrder ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Articles</dt>
              <dd>{category.articleCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Children</dt>
              <dd>{category.childrenCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Path</dt>
              <dd>{breadcrumb?.map((item) => item.name).join(' / ') || category.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(category.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          {category.description ? (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground">Description</dt>
              <dd className="text-sm">{category.description}</dd>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent>
          {category.seo ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">SEO title</dt>
                <dd>{category.seo.title ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Canonical URL</dt>
                <dd className="break-all">{category.seo.canonicalUrl ?? '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">SEO description</dt>
                <dd>{category.seo.description ?? '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Keywords</dt>
                <dd>{category.seo.keywords?.length ? category.seo.keywords.join(', ') : '—'}</dd>
              </div>
            </dl>
          ) : (
            <EmptyState title="No SEO metadata set" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Children</CardTitle>
        </CardHeader>
        <CardContent>
          {childrenLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : childrenError ? (
            <ErrorState error={childrenError} />
          ) : !children || children.length === 0 ? (
            <EmptyState title="No child categories" />
          ) : (
            <ul className="space-y-2 text-sm">
              {children.map((child) => (
                <li key={child.id} className="flex items-center justify-between border-b border-border pb-2">
                  <button
                    type="button"
                    className="hover:underline"
                    onClick={() => router.push(CATEGORY_ROUTES.detail(child.id))}
                  >
                    {child.name}
                  </button>
                  <StatusBadge status={child.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        categoryName={category.name}
        onConfirm={() => deleteMutation.mutate(category.id)}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        categoryName={category.name}
        onConfirm={() => restoreMutation.mutate(category.id)}
      />
      <MoveCategoryDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        categoryId={category.id}
        categoryName={category.name}
        currentParentId={category.parentId}
        onSubmit={(input) => moveMutation.mutate({ id: category.id, input }, { onSuccess: () => setMoveOpen(false) })}
        isSubmitting={moveMutation.isPending}
      />
    </div>
  );
}
