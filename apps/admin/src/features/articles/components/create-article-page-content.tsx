'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ARTICLE_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreateArticle } from '../hooks/use-create-article';
import { CreateArticleForm } from './article-form';
import type { CreateArticleFormValues } from '../schemas/create-article.schema';
import type { CreateArticleInput } from '../types/article';

function toCreateInput(values: CreateArticleFormValues): CreateArticleInput {
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
    authorId: values.authorId,
    primaryCategoryId: values.primaryCategoryId || undefined,
    tagIds: values.tagIds?.length ? values.tagIds : undefined,
    visibility: values.visibility,
    language: values.language,
    locale: values.locale,
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
  };
}

/** No "Publish"/"Save Draft" choice here — `CreateArticleDto` has no
 * `status` field, so every created article starts in the backend's own
 * default status regardless. Publish/Schedule are separate actions on the
 * Detail page after creation (see docs/65_FRONTEND_ARTICLES.md). */
export function CreateArticlePageContent() {
  const router = useRouter();
  const createMutation = useCreateArticle();

  function handleSubmit(values: CreateArticleFormValues) {
    createMutation.mutate(toCreateInput(values), {
      onSuccess: (article) => router.push(ARTICLE_ROUTES.detail(article.id)),
    });
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="New article" />
      <CreateArticleForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} submitError={submitError} />
    </div>
  );
}
