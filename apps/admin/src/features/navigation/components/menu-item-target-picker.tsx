'use client';

import { useState } from 'react';
import { ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePages } from '@/features/pages';
import { useArticles } from '@/features/articles';
import { useCategoryFlat } from '@/features/categories';

export type PickableContentType = 'PAGE' | 'ARTICLE' | 'CATEGORY';

export interface MenuItemTargetPickerProps {
  contentType: PickableContentType;
  value: string | undefined;
  valueLabel: string | undefined;
  onSelect: (id: string, label: string) => void;
  placeholder: string;
  /** Forwarded onto the trigger button — `FormControl`'s Slot injects
   * this so the `FormLabel`'s `htmlFor` resolves to a real element,
   * same recipe `ColorInput` uses for the same reason. */
  id?: string;
}

/**
 * A human-readable-name picker for Page/Article/Category menu-item
 * targets — the whole point of this milestone is that nobody types a raw
 * id, so the trigger shows the chosen title, never the id. Reuses the
 * real, already-shipped `GET /pages`, `GET /articles`, `GET /categories/flat`
 * endpoints (same recipe as `AssignmentEntityPicker`/`SeoEntityPicker` —
 * no dedicated search endpoint exists for this, and none is needed).
 */
export function MenuItemTargetPicker({
  contentType,
  value,
  valueLabel,
  onSelect,
  placeholder,
  id,
}: MenuItemTargetPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const pagesQuery = usePages({ page: 1, limit: 20, search: search || undefined });
  const articlesQuery = useArticles({ page: 1, limit: 20, search: search || undefined });
  const categoriesQuery = useCategoryFlat();

  const filteredCategories = (categoriesQuery.data ?? []).filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  function select(id: string, label: string) {
    onSelect(id, label);
    setOpen(false);
    setSearch('');
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={value ? '' : 'text-muted-foreground'}>
            {value ? valueLabel : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-3" align="start">
        <div className="relative mb-2">
          <Search
            className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${contentType.toLowerCase()}s…`}
            className="pl-8"
          />
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {contentType === 'PAGE' ? (
            pagesQuery.isLoading ? (
              <ListSkeleton />
            ) : pagesQuery.data?.data.length ? (
              pagesQuery.data.data.map((page) => (
                <TargetRow
                  key={page.id}
                  title={page.title}
                  slug={page.slug}
                  onSelect={() => select(page.id, page.title)}
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
                <TargetRow
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  onSelect={() => select(article.id, article.title)}
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
                <TargetRow
                  key={category.id}
                  title={category.name}
                  slug={category.slug}
                  onSelect={() => select(category.id, category.name)}
                />
              ))
            ) : (
              <EmptyState title="No categories found" />
            )
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
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

function TargetRow({
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
