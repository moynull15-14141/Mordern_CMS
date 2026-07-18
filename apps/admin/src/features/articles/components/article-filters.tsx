'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_OPTIONS, VISIBILITY_OPTIONS } from '../constants/article.constants';
import { useCategoryOptions } from '../hooks/use-category-options';
import { useTagOptions } from '../hooks/use-tag-options';
import type { ArticleVisibility, ContentStatus } from '../types/article';

export interface ArticleFiltersValue {
  status?: ContentStatus;
  visibility?: ArticleVisibility;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
}

export interface ArticleFiltersProps {
  value: ArticleFiltersValue;
  onChange: (value: ArticleFiltersValue) => void;
}

const ALL_VALUE = '__all__';

/**
 * Status/Visibility/Category/Tag map directly onto real `ArticleQueryDto`
 * fields. Category/Tag options come from `GET /categories/flat`/`GET /tags`
 * — both gated by `category.create` on the backend (no `category.view`/
 * `tag.*` permission exists), so a viewer without it sees those two
 * selectors fall back to a plain text id input rather than crash (see
 * docs/65_FRONTEND_ARTICLES.md "Known Limitations"). Author filter is a
 * real query param (`authorId`) but no Authors module/list endpoint exists
 * to source a picker from — a plain UUID input is the only honest option.
 */
export function ArticleFilters({ value, onChange }: ArticleFiltersProps) {
  const categoryOptions = useCategoryOptions();
  const tagOptions = useTagOptions();

  const hasActiveFilters = Boolean(
    value.status || value.visibility || value.authorId || value.categoryId || value.tagId,
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="article-filter-status">Status</Label>
        <Select
          value={value.status ?? ALL_VALUE}
          onValueChange={(next) => onChange({ ...value, status: next === ALL_VALUE ? undefined : (next as ContentStatus) })}
        >
          <SelectTrigger id="article-filter-status" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="article-filter-visibility">Visibility</Label>
        <Select
          value={value.visibility ?? ALL_VALUE}
          onValueChange={(next) =>
            onChange({ ...value, visibility: next === ALL_VALUE ? undefined : (next as ArticleVisibility) })
          }
        >
          <SelectTrigger id="article-filter-visibility" className="w-36">
            <SelectValue placeholder="All visibilities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All visibilities</SelectItem>
            {VISIBILITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="article-filter-category">Category</Label>
        {categoryOptions.data ? (
          <Select
            value={value.categoryId ?? ALL_VALUE}
            onValueChange={(next) => onChange({ ...value, categoryId: next === ALL_VALUE ? undefined : next })}
          >
            <SelectTrigger id="article-filter-category" className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All categories</SelectItem>
              {categoryOptions.data.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="article-filter-category"
            className="w-44"
            placeholder="Category id"
            value={value.categoryId ?? ''}
            onChange={(event) => onChange({ ...value, categoryId: event.target.value || undefined })}
          />
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="article-filter-tag">Tag</Label>
        {tagOptions.data ? (
          <Select
            value={value.tagId ?? ALL_VALUE}
            onValueChange={(next) => onChange({ ...value, tagId: next === ALL_VALUE ? undefined : next })}
          >
            <SelectTrigger id="article-filter-tag" className="w-40">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All tags</SelectItem>
              {tagOptions.data.data.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="article-filter-tag"
            className="w-40"
            placeholder="Tag id"
            value={value.tagId ?? ''}
            onChange={(event) => onChange({ ...value, tagId: event.target.value || undefined })}
          />
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="article-filter-author">Author id</Label>
        <Input
          id="article-filter-author"
          className="w-48"
          placeholder="Author id (UUID)"
          value={value.authorId ?? ''}
          onChange={(event) => onChange({ ...value, authorId: event.target.value || undefined })}
        />
      </div>

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
