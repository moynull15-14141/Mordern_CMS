'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { usePage } from '@/features/pages/hooks/use-page';
import { PageBuilderShell } from './page-builder-shell';

export interface PageBuilderPageContentProps {
  pageId: string;
}

/** The route-level entry point (`/pages/:id/builder`) — fetches the page,
 * then hands it to `PageBuilderShell` once loaded. A full-screen loading
 * skeleton, not the standard `max-w-*` form skeleton every other page
 * uses, since the builder itself is a full-screen experience. */
export function PageBuilderPageContent({ pageId }: PageBuilderPageContentProps) {
  const { data: page, isLoading, error, refetch } = usePage(pageId);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col gap-2 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="p-4">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return <PageBuilderShell page={page} />;
}
