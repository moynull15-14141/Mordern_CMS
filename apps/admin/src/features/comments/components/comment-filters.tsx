'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COMMENT_STATUS_OPTIONS } from '../constants/comments.constants';
import type { CommentFilters } from '../types/comment';

export interface CommentFiltersValue {
  status?: CommentFilters['status'];
  articleId?: string;
  userId?: string;
}

export interface CommentFiltersProps {
  value: CommentFiltersValue;
  onChange: (value: CommentFiltersValue) => void;
}

const ALL_VALUE = '__all__';

export function CommentFilters({ value, onChange }: CommentFiltersProps) {
  const hasActiveFilters = Boolean(value.status || value.articleId || value.userId);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="comment-filter-status">Status</Label>
        <Select
          value={value.status ?? ALL_VALUE}
          onValueChange={(next) => onChange({ ...value, status: next === ALL_VALUE ? undefined : (next as CommentFilters['status']) })}
        >
          <SelectTrigger id="comment-filter-status" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {COMMENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="comment-filter-article">Article id</Label>
        <Input
          id="comment-filter-article"
          className="w-56"
          placeholder="Article id (UUID)"
          value={value.articleId ?? ''}
          onChange={(event) => onChange({ ...value, articleId: event.target.value || undefined })}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="comment-filter-author">Author id</Label>
        <Input
          id="comment-filter-author"
          className="w-56"
          placeholder="Author id (UUID)"
          value={value.userId ?? ''}
          onChange={(event) => onChange({ ...value, userId: event.target.value || undefined })}
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
