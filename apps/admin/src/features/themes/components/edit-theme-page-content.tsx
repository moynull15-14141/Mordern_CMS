'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { THEME_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useTheme } from '../hooks/use-theme';
import { useUpdateTheme } from '../hooks/use-update-theme';
import { EditThemeForm } from './theme-form';
import type { UpdateThemeFormValues } from '../schemas/update-theme.schema';
import type { ThemeSettingsFormValues } from '../schemas/theme-settings.schema';
import type { Theme, ThemeSettings, UpdateThemeInput } from '../types/theme';

function toSettingsFormValues(settings: ThemeSettings | null): ThemeSettingsFormValues {
  return {
    logo: settings?.logo ?? '',
    favicon: settings?.favicon ?? '',
    primaryColor: settings?.primaryColor ?? '',
    secondaryColor: settings?.secondaryColor ?? '',
    typographyText: settings?.typography ? JSON.stringify(settings.typography, null, 2) : '',
    headerLayout: settings?.headerLayout ?? '',
    footerLayout: settings?.footerLayout ?? '',
    containerWidth: settings?.containerWidth ?? '',
    borderRadius: settings?.borderRadius ?? '',
    buttonStyle: settings?.buttonStyle ?? '',
    homepageLayout: settings?.homepageLayout ?? '',
    blogLayout: settings?.blogLayout ?? '',
    customCss: settings?.customCss ?? '',
    customJs: settings?.customJs ?? '',
  };
}

function toFormDefaults(theme: Theme): UpdateThemeFormValues {
  return {
    name: theme.name,
    slug: theme.slug,
    version: theme.version ?? '',
    author: theme.author ?? '',
    description: theme.description ?? '',
    thumbnail: theme.thumbnail ?? '',
    status: theme.status,
    settings: toSettingsFormValues(theme.settings),
  };
}

function toSettingsInput(settings: ThemeSettingsFormValues | undefined): ThemeSettings | undefined {
  if (!settings) return undefined;

  let typography: Record<string, unknown> | undefined;
  if (settings.typographyText?.trim()) {
    try {
      typography = JSON.parse(settings.typographyText);
    } catch {
      // Left undefined; see CreateThemePageContent's identical guard.
    }
  }

  const result: ThemeSettings = {
    logo: settings.logo || undefined,
    favicon: settings.favicon || undefined,
    primaryColor: settings.primaryColor || undefined,
    secondaryColor: settings.secondaryColor || undefined,
    typography,
    headerLayout: settings.headerLayout || undefined,
    footerLayout: settings.footerLayout || undefined,
    containerWidth: settings.containerWidth || undefined,
    borderRadius: settings.borderRadius || undefined,
    buttonStyle: settings.buttonStyle || undefined,
    homepageLayout: settings.homepageLayout || undefined,
    blogLayout: settings.blogLayout || undefined,
    customCss: settings.customCss || undefined,
    customJs: settings.customJs || undefined,
  };

  const hasAnyValue = Object.values(result).some((value) => value !== undefined);
  return hasAnyValue ? result : undefined;
}

function toUpdateInput(values: UpdateThemeFormValues): UpdateThemeInput {
  return {
    name: values.name,
    slug: values.slug || undefined,
    version: values.version || undefined,
    author: values.author || undefined,
    description: values.description || undefined,
    thumbnail: values.thumbnail || undefined,
    status: values.status,
    settings: toSettingsInput(values.settings),
  };
}

export interface EditThemePageContentProps {
  themeId: string;
}

/** Pessimistic update (mirrors `EditPagePageContent`) + a cancel/navigate-
 * away dirty-tracking warning. No `isActive` field here — Activate is a
 * separate Detail-page action. */
export function EditThemePageContent({ themeId }: EditThemePageContentProps) {
  const router = useRouter();
  const { data: theme, isLoading, error } = useTheme(themeId);
  const updateMutation = useUpdateTheme(themeId);
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleSubmit(values: UpdateThemeFormValues) {
    updateMutation.mutate(toUpdateInput(values), {
      onSuccess: () => router.push(THEME_ROUTES.detail(themeId)),
    });
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(THEME_ROUTES.detail(themeId));
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !theme) {
    return <ErrorState error={error} />;
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title={`Edit ${theme.name}`} />

      <EditThemeForm
        defaultValues={toFormDefaults(theme)}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitError={submitError}
        onDirtyChange={setIsDirty}
      />

      <button
        type="button"
        onClick={handleCancel}
        className="text-sm text-muted-foreground hover:underline"
      >
        Cancel
      </button>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Discard"
        variant="destructive"
        onConfirm={() => router.push(THEME_ROUTES.detail(themeId))}
      />
    </div>
  );
}
