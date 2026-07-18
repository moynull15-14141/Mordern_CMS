'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { useArticles } from '@/features/articles/hooks/use-articles';
import { useCategoryFlat } from '@/features/categories/hooks/use-category-flat';
import type { SeoEntityType } from '../types/seo';

/** Real entity search — reuses `GET /articles?search=` and
 * `GET /categories/flat` (both already-shipped endpoints) since the SEO
 * module itself has no list endpoint (see docs/68_FRONTEND_SEO.md). */
export function SeoEntityPicker({
  onSelect,
}: {
  onSelect: (entityType: SeoEntityType, entityId: string, label: string) => void;
}) {
  const [tab, setTab] = useState<SeoEntityType>('article');
  const [search, setSearch] = useState('');

  const articlesQuery = useArticles({ page: 1, limit: 20, search: search || undefined });
  const categoriesQuery = useCategoryFlat();

  const filteredCategories = (categoriesQuery.data ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as SeoEntityType)}>
        <TabsList>
          <TabsTrigger value="article">Articles</TabsTrigger>
          <TabsTrigger value="category">Categories</TabsTrigger>
        </TabsList>

        <div className="relative mt-4">
          <Search
            className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'article' ? 'Search articles…' : 'Search categories…'}
            className="pl-8"
          />
        </div>

        <TabsContent value="article" className="mt-3 max-h-80 space-y-1 overflow-y-auto">
          {articlesQuery.isLoading ? (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </>
          ) : articlesQuery.data?.data.length ? (
            articlesQuery.data.data.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => onSelect('article', article.id, article.title)}
                className="flex w-full flex-col rounded-md border border-transparent px-3 py-2 text-left text-sm hover:border-border hover:bg-accent"
              >
                <span className="font-medium">{article.title}</span>
                <span className="text-xs text-muted-foreground">/{article.slug}</span>
              </button>
            ))
          ) : (
            <EmptyState title="No articles found" />
          )}
        </TabsContent>

        <TabsContent value="category" className="mt-3 max-h-80 space-y-1 overflow-y-auto">
          {categoriesQuery.isLoading ? (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </>
          ) : filteredCategories.length ? (
            filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelect('category', category.id, category.name)}
                className="flex w-full flex-col rounded-md border border-transparent px-3 py-2 text-left text-sm hover:border-border hover:bg-accent"
              >
                <span className="font-medium">{category.name}</span>
                <span className="text-xs text-muted-foreground">/{category.slug}</span>
              </button>
            ))
          ) : (
            <EmptyState title="No categories found" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
