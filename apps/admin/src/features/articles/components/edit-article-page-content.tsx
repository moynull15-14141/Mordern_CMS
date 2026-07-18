'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { ARTICLE_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useArticle } from '../hooks/use-article';
import { useUpdateArticle } from '../hooks/use-update-article';
import { EditArticleForm } from './article-form';
import type { UpdateArticleFormValues } from '../schemas/update-article.schema';
import type { Article, GenericUpdateStatus, UpdateArticleInput } from '../types/article';

/** `body` is an arbitrary `Record<string, unknown>` (`@IsObject()`, no
 * nested DTO) — this milestone's own placeholder writer always stores
 * `{ text: string }` (see `create-article.schema.ts`), so that's read back
 * directly; anything else (a future rich-editor document, or hand-seeded
 * data) is shown as its raw JSON rather than silently dropped. */
function bodyToText(body: unknown): string {
  if (body && typeof body === 'object' && 'text' in body && typeof (body as { text: unknown }).text === 'string') {
    return (body as { text: string }).text;
  }
  return JSON.stringify(body ?? {});
}

function toFormDefaults(article: Article): UpdateArticleFormValues {
  return {
    title: article.title,
    subtitle: article.subtitle ?? '',
    slug: article.slug,
    summary: article.summary ?? '',
    bodyText: bodyToText(article.body),
    status: (article.status === 'PUBLISHED' || article.status === 'SCHEDULED' || article.status === 'DELETED'
      ? 'DRAFT'
      : article.status) as GenericUpdateStatus,
    primaryCategoryId: article.category?.id ?? '',
    tagIds: article.tags.map((tag) => tag.id),
    visibility: article.visibility,
    featuredMediaId: article.featuredMediaId ?? '',
    notes: article.notes ?? '',
    seo: {
      title: article.seo?.title ?? '',
      description: article.seo?.description ?? '',
      canonicalUrl: article.seo?.canonicalUrl ?? '',
      keywords: article.seo?.keywords?.join(', ') ?? '',
    },
    revisionComment: '',
  };
}

function toUpdateInput(values: UpdateArticleFormValues): UpdateArticleInput {
  const keywords = values.seo?.keywords
    ? values.seo.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
    : undefined;
  const hasSeo = Boolean(values.seo?.title || values.seo?.description || values.seo?.canonicalUrl || keywords?.length);

  return {
    title: values.title,
    subtitle: values.subtitle || undefined,
    slug: values.slug || undefined,
    summary: values.summary || undefined,
    body: { text: values.bodyText },
    status: values.status,
    primaryCategoryId: values.primaryCategoryId || undefined,
    tagIds: values.tagIds,
    visibility: values.visibility,
    featuredMediaId: values.featuredMediaId || undefined,
    notes: values.notes || undefined,
    seo: hasSeo
      ? {
          title: values.seo?.title || undefined,
          description: values.seo?.description || undefined,
          canonicalUrl: values.seo?.canonicalUrl || undefined,
          keywords,
        }
      : undefined,
    revisionComment: values.revisionComment || undefined,
  };
}

export interface EditArticlePageContentProps {
  articleId: string;
}

/** Pessimistic update (mirrors `EditUserPageContent`) + a cancel/navigate-away
 * dirty-tracking warning. `status` here can only reach DRAFT/REVIEW/ARCHIVED
 * — Publish/Schedule are separate Detail-page actions. */
export function EditArticlePageContent({ articleId }: EditArticlePageContentProps) {
  const router = useRouter();
  const { data: article, isLoading, error } = useArticle(articleId);
  const updateMutation = useUpdateArticle(articleId);
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleSubmit(values: UpdateArticleFormValues) {
    updateMutation.mutate(toUpdateInput(values), {
      onSuccess: () => router.push(ARTICLE_ROUTES.detail(articleId)),
    });
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(ARTICLE_ROUTES.detail(articleId));
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !article) {
    return <ErrorState error={error} />;
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={`Edit ${article.title}`} />

      <EditArticleForm
        defaultValues={toFormDefaults(article)}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitError={submitError}
        onDirtyChange={setIsDirty}
      />

      <button type="button" onClick={handleCancel} className="text-sm text-muted-foreground hover:underline">
        Cancel
      </button>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Discard"
        variant="destructive"
        onConfirm={() => router.push(ARTICLE_ROUTES.detail(articleId))}
      />
    </div>
  );
}
