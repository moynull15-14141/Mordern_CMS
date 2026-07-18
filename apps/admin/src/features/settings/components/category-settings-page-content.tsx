'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useSettingsByCategory } from '../hooks/use-settings-by-category';
import { useBulkUpdateCategory } from '../hooks/use-bulk-update-category';
import { useResetCategory } from '../hooks/use-reset-category';
import { useUnsavedChangesWarning } from '../hooks/use-unsaved-changes-warning';
import { CategorySettingsForm } from './category-settings-form';
import { ResetCategoryDialog } from './reset-category-dialog';
import { SETTING_CATEGORY_LABELS } from '../constants/settings.constants';
import type { SettingCategory, SettingEntry } from '../types/settings';

export interface CategorySettingsPageContentProps {
  category: SettingCategory;
}

/**
 * One page per `SettingCategory` (docs/56 "settings/[category]/page.tsx").
 * Pessimistic bulk save (mirrors `EditUserPageContent`): navigates back to
 * the Settings overview only after the mutation resolves — avoided keeping
 * the user on this page and reconciling the form's dirty/default-values
 * state against a background refetch, which would risk silently discarding
 * an unrelated in-progress edit.
 */
export function CategorySettingsPageContent({ category }: CategorySettingsPageContentProps) {
  const router = useRouter();
  const { data: settings, isLoading, error, refetch } = useSettingsByCategory(category);
  const bulkUpdateMutation = useBulkUpdateCategory(category);
  const resetMutation = useResetCategory();

  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useUnsavedChangesWarning(isDirty);

  function handleSubmit(entries: SettingEntry[]) {
    bulkUpdateMutation.mutate(
      { settings: entries },
      { onSuccess: () => router.push(ROUTES.SETTINGS) },
    );
  }

  function handleBack() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(ROUTES.SETTINGS);
  }

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error || !settings) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const submitError = bulkUpdateMutation.isError
    ? isApiError(bulkUpdateMutation.error)
      ? bulkUpdateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader
        title={SETTING_CATEGORY_LABELS[category]}
        actions={
          <PermissionGate permissions={PERMISSIONS.SETTINGS_MANAGE}>
            <Button variant="outline" onClick={() => setResetConfirmOpen(true)}>
              Reset to defaults
            </Button>
          </PermissionGate>
        }
      />

      {settings.length === 0 ? (
        <EmptyState title="No settings in this category" />
      ) : (
        <CategorySettingsForm
          settings={settings}
          onSubmit={handleSubmit}
          isSubmitting={bulkUpdateMutation.isPending}
          submitError={submitError}
          onDirtyChange={setIsDirty}
        />
      )}

      <button type="button" onClick={handleBack} className="text-sm text-muted-foreground hover:underline">
        Back to Settings
      </button>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Discard"
        variant="destructive"
        onConfirm={() => router.push(ROUTES.SETTINGS)}
      />

      <ResetCategoryDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        category={category}
        onConfirm={() => resetMutation.mutate(category)}
      />
    </div>
  );
}
