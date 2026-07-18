'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { isApiError } from '@/lib/api-error';
import { useArticle } from '@/features/articles/hooks/use-article';
import { useCategory } from '@/features/categories/hooks/use-category';
import { useSeoForEntity } from '../hooks/use-seo-for-entity';
import { useUpdateSeo } from '../hooks/use-update-seo';
import { computeSeoScore } from '../lib/seo-score';
import { SeoEntityPicker } from './seo-entity-picker';
import { SeoHealthPanel } from './seo-health-panel';
import { SeoChecklist } from './seo-checklist';
import { SeoEditorForm, formValuesToSeoFields } from './seo-editor-form';
import { GooglePreview } from './google-preview';
import { FacebookPreview } from './facebook-preview';
import { TwitterPreview } from './twitter-preview';
import { SlugAnalyzer } from './slug-analyzer';
import type { SeoEditorFormValues } from '../schemas/seo-editor.schema';
import type { SeoEntityType } from '../types/seo';

const SITE_ORIGIN = 'example.com';

export function SeoIntelligenceCenter() {
  const [selection, setSelection] = useState<{
    type: SeoEntityType;
    id: string;
    label: string;
  } | null>(null);

  if (!selection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select an article or category</CardTitle>
        </CardHeader>
        <CardContent>
          <SeoEntityPicker onSelect={(type, id, label) => setSelection({ type, id, label })} />
        </CardContent>
      </Card>
    );
  }

  return (
    <SeoIntelligenceCenterForEntity
      entityType={selection.type}
      entityId={selection.id}
      label={selection.label}
      onBack={() => setSelection(null)}
    />
  );
}

function SeoIntelligenceCenterForEntity({
  entityType,
  entityId,
  label,
  onBack,
}: {
  entityType: SeoEntityType;
  entityId: string;
  label: string;
  onBack: () => void;
}) {
  const articleQuery = useArticle(entityType === 'article' ? entityId : '');
  const categoryQuery = useCategory(entityType === 'category' ? entityId : '');
  const seoQuery = useSeoForEntity(entityType, entityId);
  const [liveValues, setLiveValues] = useState<SeoEditorFormValues | null>(null);

  const slug = entityType === 'article' ? articleQuery.data?.slug : categoryQuery.data?.slug;

  const scoreInput = useMemo(() => {
    if (liveValues) {
      const fields = formValuesToSeoFields(liveValues, seoQuery.data);
      return { ...fields, slug };
    }
    return {
      title: seoQuery.data?.title ?? undefined,
      description: seoQuery.data?.description ?? undefined,
      canonicalUrl: seoQuery.data?.canonicalUrl ?? undefined,
      keywords: seoQuery.data?.keywords ?? undefined,
      openGraph: seoQuery.data?.openGraph ?? undefined,
      twitterCard: seoQuery.data?.twitterCard ?? undefined,
      schemaJson: seoQuery.data?.schemaJson ?? undefined,
      robots: seoQuery.data?.robots ?? undefined,
      slug,
    };
  }, [liveValues, seoQuery.data, slug]);

  const score = useMemo(() => computeSeoScore(scoreInput), [scoreInput]);

  const updateSeo = useUpdateSeo(seoQuery.data?.id ?? '', entityType, entityId);

  const notFound = isApiError(seoQuery.error) && seoQuery.error.isNotFound;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">
            {entityType === 'article' ? 'Article' : 'Category'}
          </p>
          <h2 className="text-lg font-semibold">{label}</h2>
        </div>
      </div>

      {seoQuery.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      ) : notFound ? (
        <EmptyState
          title="No SEO record yet"
          description="This item has no saved SEO data yet. Add SEO details from the article or category edit page first — the SEO Intelligence Center can then manage it here."
        />
      ) : seoQuery.isError ? (
        <ErrorState error={seoQuery.error} onRetry={() => seoQuery.refetch()} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <SeoHealthPanel result={score} />

            <Card>
              <CardHeader>
                <CardTitle>SEO Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <SeoChecklist checks={score.checks} />
              </CardContent>
            </Card>

            {slug ? (
              <Card id="seo-section-slug">
                <CardHeader>
                  <CardTitle>Slug Analyzer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-muted-foreground">/{slug}</p>
                  <SlugAnalyzer slug={slug} />
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Previews</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div id="seo-section-preview-google" className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Google</p>
                  <GooglePreview
                    title={liveValues?.title || seoQuery.data?.title || ''}
                    description={liveValues?.description || seoQuery.data?.description || ''}
                    url={`https://${SITE_ORIGIN}/${slug ?? ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Facebook</p>
                  <FacebookPreview
                    title={liveValues?.ogTitle || liveValues?.title || ''}
                    description={liveValues?.ogDescription || liveValues?.description || ''}
                    image={liveValues?.ogImage || undefined}
                    domain={SITE_ORIGIN}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Twitter</p>
                  <TwitterPreview
                    title={liveValues?.twitterTitle || liveValues?.title || ''}
                    description={liveValues?.twitterDescription || liveValues?.description || ''}
                    image={liveValues?.twitterImage || undefined}
                    domain={SITE_ORIGIN}
                    card={liveValues?.twitterCard}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <SeoEditorForm
                  seo={seoQuery.data}
                  onChange={setLiveValues}
                  isSaving={updateSeo.isPending}
                  onSubmit={(values) => {
                    if (!seoQuery.data) return;
                    updateSeo.mutate(formValuesToSeoFields(values, seoQuery.data));
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
