'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { isApiError } from '@/lib/api-error';
import { useMenu } from '../hooks/use-menus';
import { useUpdateMenu } from '../hooks/use-menu-mutations';
import { MenuSettingsForm } from './menu-settings-form';
import { MenuItemTree } from './menu-item-tree';
import type { UpdateMenuFormValues } from '../schemas/update-menu.schema';

export interface EditNavigationPageContentProps {
  menuId: string;
}

export function EditNavigationPageContent({ menuId }: EditNavigationPageContentProps) {
  const menuQuery = useMenu(menuId);
  const updateMutation = useUpdateMenu(menuId);

  if (menuQuery.isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (menuQuery.error || !menuQuery.data) {
    return <ErrorState error={menuQuery.error} onRetry={() => menuQuery.refetch()} />;
  }

  const menu = menuQuery.data;

  function handleSaveSettings(values: UpdateMenuFormValues) {
    updateMutation.mutate({
      name: values.name,
      slug: values.slug || undefined,
      location: values.location || undefined,
      status: values.status,
    });
  }

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title={menu.name} description="Edit this navigation menu." />

      <section className="space-y-4 rounded-md border border-border p-4">
        <h2 className="text-sm font-medium">Settings</h2>
        <MenuSettingsForm
          menu={menu}
          onSubmit={handleSaveSettings}
          isSubmitting={updateMutation.isPending}
          submitError={
            updateMutation.isError
              ? isApiError(updateMutation.error)
                ? updateMutation.error.message
                : 'Could not save this navigation menu.'
              : null
          }
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">Navigation structure</h2>
          <p className="text-xs text-muted-foreground">
            Drag items to reorder or nest them, or use the arrow buttons. Changes save
            automatically.
          </p>
        </div>
        <MenuItemTree menuId={menu.id} items={menu.items ?? []} />
      </section>
    </div>
  );
}
