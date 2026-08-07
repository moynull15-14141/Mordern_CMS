'use client';

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useAppForm } from '@/hooks/use-app-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/toast';
import { isApiError } from '@/lib/api-error';
import { GENERIC_UPDATE_STATUS_OPTIONS } from '@/features/pages/constants/page.constants';
import { useUpdatePage } from '@/features/pages/hooks/use-update-page';
import { SeoFields } from '@/features/pages/components/seo-fields';
import { pageSettingsSchema, type PageSettingsFormValues } from '../schemas/page-settings.schema';
import type { GenericUpdateStatus, Page } from '@/features/pages/types/page';

export interface PageSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: Page;
}

function toDefaults(page: Page): PageSettingsFormValues {
  return {
    title: page.title,
    slug: page.slug,
    status: (page.status === 'PUBLISHED' || page.status === 'SCHEDULED' || page.status === 'DELETED'
      ? 'DRAFT'
      : page.status) as GenericUpdateStatus,
    seo: {
      title: page.seo?.title ?? '',
      description: page.seo?.description ?? '',
      canonicalUrl: page.seo?.canonicalUrl ?? '',
      keywords: page.seo?.keywords?.join(', ') ?? '',
    },
  };
}

/**
 * Page Settings (spec Phase 12: General/SEO, Layout/Social/Advanced are
 * explicitly deferred — see the final report) — a separate experience
 * from the canvas, deliberately never touching `body` (the canvas's own
 * autosave owns that field exclusively; see `page-settings.schema.ts`'s
 * doc comment). Template/Header/Footer/Container-width/custom-code
 * settings aren't included because no such fields exist on `Page` today
 * (verified against `apps/backend/src/modules/pages` — no `layoutId`,
 * `templateId`, or custom-code column) — inventing them here would be a
 * second, disconnected settings system the backend can't actually persist.
 */
export function PageSettingsDrawer({ open, onOpenChange, page }: PageSettingsDrawerProps) {
  const form = useAppForm(pageSettingsSchema, { defaultValues: toDefaults(page) });
  const updateMutation = useUpdatePage(page.id);

  function handleSubmit(values: PageSettingsFormValues) {
    const keywords = values.seo?.keywords
      ? values.seo.keywords
          .split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean)
      : undefined;
    const hasSeo = Boolean(
      values.seo?.title || values.seo?.description || values.seo?.canonicalUrl || keywords?.length
    );

    updateMutation.mutate(
      {
        title: values.title,
        slug: values.slug || undefined,
        status: values.status,
        seo: hasSeo
          ? {
              title: values.seo?.title || undefined,
              description: values.seo?.description || undefined,
              canonicalUrl: values.seo?.canonicalUrl || undefined,
              keywords,
            }
          : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Page settings saved.');
          onOpenChange(false);
        },
      }
    );
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full max-w-md gap-4 overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Page settings</DrawerTitle>
        </DrawerHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            {submitError ? (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENERIC_UPDATE_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SeoFields control={form.control} />

            <FormSubmitButton
              isLoading={updateMutation.isPending}
              disabled={updateMutation.isPending}
            >
              Save settings
            </FormSubmitButton>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
}
