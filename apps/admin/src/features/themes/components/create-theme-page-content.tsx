'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { THEME_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreateTheme } from '../hooks/use-create-theme';
import { CreateThemeForm } from './theme-form';
import type { CreateThemeFormValues } from '../schemas/create-theme.schema';
import type { ThemeSettingsFormValues } from '../schemas/theme-settings.schema';
import type { CreateThemeInput, ThemeSettings } from '../types/theme';

function toSettingsInput(settings: ThemeSettingsFormValues | undefined): ThemeSettings | undefined {
  if (!settings) return undefined;

  let typography: Record<string, unknown> | undefined;
  if (settings.typographyText?.trim()) {
    try {
      typography = JSON.parse(settings.typographyText);
    } catch {
      // Left undefined; the form's own JSON validation surfaces the parse
      // error separately — silently dropping malformed JSON here avoids
      // sending an invalid payload.
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

function toCreateInput(values: CreateThemeFormValues): CreateThemeInput {
  return {
    name: values.name,
    slug: values.slug || undefined,
    version: values.version || undefined,
    author: values.author || undefined,
    description: values.description || undefined,
    thumbnail: values.thumbnail || undefined,
    settings: toSettingsInput(values.settings),
  };
}

/** No "Activate on create" choice — `CreateThemeDto` has no `status`/
 * `isActive` field, so every created theme starts DRAFT and inactive.
 * Activate is a separate action on the Detail page after creation. */
export function CreateThemePageContent() {
  const router = useRouter();
  const createMutation = useCreateTheme();

  function handleSubmit(values: CreateThemeFormValues) {
    createMutation.mutate(toCreateInput(values), {
      onSuccess: (theme) => router.push(THEME_ROUTES.detail(theme.id)),
    });
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="New theme" />
      <CreateThemeForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitError={submitError}
      />
    </div>
  );
}
