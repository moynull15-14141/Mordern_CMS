'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Smartphone, Star, Tablet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { PermissionGate } from '@/components/guards/permission-gate';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { cn } from '@/utils/cn';
import { PERMISSIONS } from '@/constants/permissions';
import { PATTERN_ROUTES } from '@/constants/routes';
import { env } from '@/lib/env';
import { usePattern, usePatternUsages } from '../hooks/use-patterns';
import {
  useAddPatternFavorite,
  useFavoritePatterns,
  useRemovePatternFavorite,
} from '../hooks/use-pattern-favorites';
import {
  useArchivePattern,
  useDeletePattern,
  useDuplicatePattern,
  useRestorePattern,
  useUnarchivePattern,
} from '../hooks/use-pattern-mutations';
import { UsageList } from './usage-list';

export interface PatternDetailPageContentProps {
  patternId: string;
}

type PreviewWidth = 'desktop' | 'tablet' | 'mobile';

const PREVIEW_WIDTHS: Record<PreviewWidth, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

/**
 * Pattern Inspector — Name/Description/Category/Tags/Preview/Version/
 * Created/Updated/Created By/usage-origin info + Edit/Duplicate/Archive/
 * Restore/Delete (Milestone 6 spec). Preview reuses the existing Block
 * Renderer by embedding the public `apps/web` preview route in an
 * `<iframe>` rather than reimplementing rendering here — the two admin/web
 * Next.js apps can't share React components directly, so this is the one
 * way to literally reuse (not reimplement) the renderer.
 */
export function PatternDetailPageContent({ patternId }: PatternDetailPageContentProps) {
  const router = useRouter();
  const { data: pattern, isLoading, error, refetch } = usePattern(patternId);
  const { data: usages, isLoading: usagesLoading } = usePatternUsages(patternId);
  const favoritesQuery = useFavoritePatterns();
  const addFavoriteMutation = useAddPatternFavorite();
  const removeFavoriteMutation = useRemovePatternFavorite();

  const archiveMutation = useArchivePattern();
  const unarchiveMutation = useUnarchivePattern();
  const deleteMutation = useDeletePattern();
  const restoreMutation = useRestorePattern();
  const duplicateMutation = useDuplicatePattern();

  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>('desktop');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!pattern) return <EmptyState title="Pattern not found" />;

  const isFavorite = (favoritesQuery.data ?? []).some((f) => f.id === pattern.id);
  const isArchived = pattern.status === 'ARCHIVED';

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={pattern.name}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
              onClick={() =>
                isFavorite
                  ? removeFavoriteMutation.mutate(pattern.id)
                  : addFavoriteMutation.mutate(pattern.id)
              }
            >
              <Star className={cn('size-4', isFavorite && 'fill-current text-warning')} />
            </Button>
            {pattern.deletedAt ? (
              <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
                <Button variant="outline" onClick={() => restoreMutation.mutate(pattern.id)}>
                  Restore
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
                <Button
                  variant="outline"
                  onClick={() => router.push(PATTERN_ROUTES.edit(pattern.id))}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    duplicateMutation.mutate(pattern.id, {
                      onSuccess: (created) => router.push(PATTERN_ROUTES.detail(created.id)),
                    })
                  }
                >
                  Duplicate
                </Button>
                {isArchived ? (
                  <Button variant="outline" onClick={() => unarchiveMutation.mutate(pattern.id)}>
                    Unarchive
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setArchiveOpen(true)}>
                    Archive
                  </Button>
                )}
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
          <CardTitle>{pattern.name}</CardTitle>
          <Badge variant={isArchived ? 'outline' : 'success'}>
            {isArchived ? 'Archived' : 'Active'}
          </Badge>
          {pattern.deletedAt ? <Badge variant="outline">Deleted</Badge> : null}
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd>{pattern.category ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Version</dt>
              <dd>{pattern.version}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(pattern.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(pattern.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          {pattern.description ? (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground">Description</dt>
              <dd className="text-sm">{pattern.description}</dd>
            </div>
          ) : null}
          {pattern.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1">
              {pattern.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Preview</CardTitle>
          <div className="flex items-center gap-1" role="group" aria-label="Preview width">
            <Button
              type="button"
              variant={previewWidth === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              aria-label="Desktop preview"
              aria-pressed={previewWidth === 'desktop'}
              onClick={() => setPreviewWidth('desktop')}
            >
              <Monitor className="size-4" />
            </Button>
            <Button
              type="button"
              variant={previewWidth === 'tablet' ? 'secondary' : 'ghost'}
              size="icon"
              aria-label="Tablet preview"
              aria-pressed={previewWidth === 'tablet'}
              onClick={() => setPreviewWidth('tablet')}
            >
              <Tablet className="size-4" />
            </Button>
            <Button
              type="button"
              variant={previewWidth === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              aria-label="Mobile preview"
              aria-pressed={previewWidth === 'mobile'}
              onClick={() => setPreviewWidth('mobile')}
            >
              <Smartphone className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border bg-muted/30 p-2">
            <iframe
              key={previewWidth}
              src={`${env.NEXT_PUBLIC_WEB_URL}/preview/patterns/${pattern.id}`}
              title={`Preview of ${pattern.name}`}
              className="h-[36rem] rounded-sm border border-border bg-background"
              style={{ width: PREVIEW_WIDTHS[previewWidth], maxWidth: '100%' }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inserted from this pattern</CardTitle>
        </CardHeader>
        <CardContent>
          {usagesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : usages && usages.length > 0 ? (
            <UsageList usages={usages} />
          ) : (
            <p className="text-sm text-muted-foreground">Not inserted anywhere yet.</p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete pattern"
        description={`Delete "${pattern.name}"? This can be undone by restoring it later. Pages/articles that already inserted a copy of this pattern are unaffected.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate(pattern.id)}
      />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive pattern"
        description={`Archive "${pattern.name}"? It will be hidden from the Pattern Picker until unarchived.`}
        confirmLabel="Archive"
        onConfirm={() => archiveMutation.mutate(pattern.id)}
      />
    </div>
  );
}
