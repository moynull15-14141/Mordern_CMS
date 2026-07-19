'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { usePages } from '@/features/pages';
import { useArticles } from '@/features/articles';
import { useCategoryFlat } from '@/features/categories';
import type { LayoutAssignmentContentType } from '../types/layout-assignment';

export interface AssignmentEntityPickerProps {
  contentType: Exclude<LayoutAssignmentContentType, 'HOMEPAGE'>;
  onSelect: (entityId: string, label: string) => void;
}

/**
 * Real entity search — reuses `GET /pages`, `GET /articles`, and
 * `GET /categories/flat` (all already-shipped, already-used-elsewhere
 * endpoints), mirroring `SeoEntityPicker`'s exact "no dedicated search
 * endpoint for this module, reuse the real content list endpoints" shape.
 */
export function AssignmentEntityPicker({ contentType, onSelect }: AssignmentEntityPickerProps) {
  const [search, setSearch] = useState('');

  const pagesQuery = usePages({ page: 1, limit: 20, search: search || undefined });
  const articlesQuery = useArticles({ page: 1, limit: 20, search: search || undefined });
  const categoriesQuery = useCategoryFlat();

  const filteredCategories = (categoriesQuery.data ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${contentType.toLowerCase()}s…`}
          className="pl-8"
        />
      </div>

      <div className="max-h-72 space-y-1 overflow-y-auto">
        {contentType === 'PAGE' ? (
          pagesQuery.isLoading ? (
            <ListSkeleton />
          ) : pagesQuery.data?.data.length ? (
            pagesQuery.data.data.map((page) => (
              <EntityRow
                key={page.id}
                title={page.title}
                slug={page.slug}
                onSelect={() => onSelect(page.id, page.title)}
              />
            ))
          ) : (
            <EmptyState title="No pages found" />
          )
        ) : null}

        {contentType === 'ARTICLE' ? (
          articlesQuery.isLoading ? (
            <ListSkeleton />
          ) : articlesQuery.data?.data.length ? (
            articlesQuery.data.data.map((article) => (
              <EntityRow
                key={article.id}
                title={article.title}
                slug={article.slug}
                onSelect={() => onSelect(article.id, article.title)}
              />
            ))
          ) : (
            <EmptyState title="No articles found" />
          )
        ) : null}

        {contentType === 'CATEGORY' ? (
          categoriesQuery.isLoading ? (
            <ListSkeleton />
          ) : filteredCategories.length ? (
            filteredCategories.map((category) => (
              <EntityRow
                key={category.id}
                title={category.name}
                slug={category.slug}
                onSelect={() => onSelect(category.id, category.name)}
              />
            ))
          ) : (
            <EmptyState title="No categories found" />
          )
        ) : null}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <>
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </>
  );
}

function EntityRow({
  title,
  slug,
  onSelect,
}: {
  title: string;
  slug: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col rounded-md border border-transparent px-3 py-2 text-left text-sm hover:border-border hover:bg-accent"
    >
      <span className="font-medium">{title}</span>
      <span className="text-xs text-muted-foreground">/{slug}</span>
    </button>
  );
}
