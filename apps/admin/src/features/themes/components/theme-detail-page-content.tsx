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
import { THEME_ROUTES } from '@/constants/routes';
import { useTheme } from '../hooks/use-theme';
import { useDeleteTheme } from '../hooks/use-delete-theme';
import { useRestoreTheme } from '../hooks/use-restore-theme';
import { useActivateTheme } from '../hooks/use-activate-theme';
import { StatusBadge } from './status-badge';
import { ActiveBadge } from './active-badge';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { ActivateDialog } from './activate-dialog';
import { ThemePreview } from './theme-preview';
import type { ThemeSettings } from '../types/theme';

function toPreviewSettings(settings: ThemeSettings | null) {
  return {
    primaryColor: settings?.primaryColor ?? '',
    secondaryColor: settings?.secondaryColor ?? '',
    typographyText: settings?.typography ? JSON.stringify(settings.typography) : '',
    headerLayout: settings?.headerLayout ?? '',
    footerLayout: settings?.footerLayout ?? '',
    containerWidth: settings?.containerWidth ?? '',
    borderRadius: settings?.borderRadius ?? '',
    buttonStyle: settings?.buttonStyle ?? '',
  };
}

export interface ThemeDetailPageContentProps {
  themeId: string;
}

/**
 * Theme Details — metadata, read-only appearance preview, status, active
 * state, actions. No "activation timestamp" field exists on `Theme` (only
 * `isActive`) — `updatedAt` is shown labeled honestly as "Last updated"
 * rather than presenting it as a dedicated activation time (see
 * docs/72_BACKEND_THEMES.md "Known Limitations"). Activate appears only
 * for a non-active, non-deleted theme and requires `theme.manage` (the
 * single permission gating every Themes action).
 */
export function ThemeDetailPageContent({ themeId }: ThemeDetailPageContentProps) {
  const router = useRouter();
  const { data: theme, isLoading, error, refetch } = useTheme(themeId);

  const deleteMutation = useDeleteTheme();
  const restoreMutation = useRestoreTheme();
  const activateMutation = useActivateTheme();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);

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

  if (!theme) {
    return <EmptyState title="Theme not found" />;
  }

  const canActivate = !theme.deletedAt && !theme.isActive;

  return (
    <div className="space-y-6">
      <PageHeader
        title={theme.name}
        actions={
          <div className="flex flex-wrap gap-2">
            {theme.deletedAt ? (
              <PermissionGate permissions={PERMISSIONS.THEME_MANAGE}>
                <Button variant="outline" onClick={() => setRestoreOpen(true)}>
                  Restore
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permissions={PERMISSIONS.THEME_MANAGE}>
                <Button variant="outline" onClick={() => router.push(THEME_ROUTES.edit(theme.id))}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActivateOpen(true)}
                  disabled={!canActivate}
                >
                  {theme.isActive ? 'Active' : 'Activate'}
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
          <CardTitle>{theme.name}</CardTitle>
          <StatusBadge status={theme.status} />
          <ActiveBadge isActive={theme.isActive} />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-mono">{theme.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Version</dt>
              <dd>{theme.version ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Author</dt>
              <dd>{theme.author ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(theme.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {theme.isActive ? 'Active since (last updated)' : 'Last updated'}
              </dt>
              <dd>{new Date(theme.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          {theme.description ? (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground">Description</dt>
              <dd className="text-sm">{theme.description}</dd>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ThemePreview settings={toPreviewSettings(theme.settings)} />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        themeName={theme.name}
        onConfirm={() => deleteMutation.mutate(theme.id)}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        themeName={theme.name}
        onConfirm={() => restoreMutation.mutate(theme.id)}
      />
      <ActivateDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        themeName={theme.name}
        onConfirm={() => activateMutation.mutate(theme.id)}
      />
    </div>
  );
}
