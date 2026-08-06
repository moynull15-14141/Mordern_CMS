'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { PAGE_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import type { BlockNode } from '@/features/block-editor';
import { usePage } from '../hooks/use-page';
import { useUpdatePage } from '../hooks/use-update-page';
import { EditPageForm } from './page-form';
import type { UpdatePageFormValues } from '../schemas/update-page.schema';
import type { GenericUpdateStatus, Page, UpdatePageInput } from '../types/page';

/** `body` is an arbitrary `Record<string, unknown>` (`@IsObject()`, no
 * nested DTO) — the Block Editor always stores `{ blocks: BlockNode[] }`
 * (see `create-page.schema.ts`), so that's read back directly; any other
 * shape (content written before Milestone 3, or hand-seeded data)
 * degrades to an empty block list rather than crashing the edit form —
 * same convention `articles/components/edit-article-page-content.tsx`'s
 * `bodyToBlocks` establishes. */
function bodyToBlocks(body: unknown): BlockNode[] {
  if (
    body &&
    typeof body === 'object' &&
    'blocks' in body &&
    Array.isArray((body as { blocks: unknown }).blocks)
  ) {
    return (body as { blocks: unknown[] }).blocks as BlockNode[];
  }
  return [];
}

function toFormDefaults(page: Page): UpdatePageFormValues {
  return {
    title: page.title,
    slug: page.slug,
    body: bodyToBlocks(page.body),
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

function toUpdateInput(values: UpdatePageFormValues): UpdatePageInput {
  const keywords = values.seo?.keywords
    ? values.seo.keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    : undefined;
  const hasSeo = Boolean(
    values.seo?.title || values.seo?.description || values.seo?.canonicalUrl || keywords?.length
  );

  return {
    title: values.title,
    slug: values.slug || undefined,
    body: { blocks: values.body },
    status: values.status,
    seo: hasSeo
      ? {
          title: values.seo?.title || undefined,
          description: values.seo?.description || undefined,
          canonicalUrl: values.seo?.canonicalUrl || undefined,
          keywords,
        }
      : undefined,
  };
}

export interface EditPagePageContentProps {
  pageId: string;
}

/** Pessimistic update (mirrors `EditArticlePageContent`) + a cancel/
 * navigate-away dirty-tracking warning. `status` here can only reach
 * DRAFT/REVIEW/ARCHIVED — Publish is a separate Detail-page action. */
export function EditPagePageContent({ pageId }: EditPagePageContentProps) {
  const router = useRouter();
  const { data: page, isLoading, error } = usePage(pageId);
  const updateMutation = useUpdatePage(pageId);
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleSubmit(values: UpdatePageFormValues) {
    updateMutation.mutate(toUpdateInput(values), {
      onSuccess: () => router.push(PAGE_ROUTES.detail(pageId)),
    });
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(PAGE_ROUTES.detail(pageId));
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !page) {
    return <ErrorState error={error} />;
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={`Edit ${page.title}`} />

      <EditPageForm
        defaultValues={toFormDefaults(page)}
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
        onConfirm={() => router.push(PAGE_ROUTES.detail(pageId))}
      />
    </div>
  );
}
