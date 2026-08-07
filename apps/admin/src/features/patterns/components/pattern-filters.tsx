'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PatternStatus } from '../types/pattern';

export interface PatternFiltersValue {
  category?: string;
  status?: PatternStatus;
}

export interface PatternFiltersProps {
  value: PatternFiltersValue;
  onChange: (value: PatternFiltersValue) => void;
  /** Distinct category values seen on the current page's results — a
   * lightweight, non-authoritative option list (matches the Pattern
   * Picker's own approach), not a separate "list all categories" endpoint
   * the spec never asked for. */
  categoryOptions: string[];
}

const ALL_VALUE = '__all__';

export function PatternFilters({ value, onChange, categoryOptions }: PatternFiltersProps) {
  const hasActiveFilters = Boolean(value.category) || Boolean(value.status);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="pattern-filter-category">Category</Label>
        <Select
          value={value.category ?? ALL_VALUE}
          onValueChange={(next) =>
            onChange({ ...value, category: next === ALL_VALUE ? undefined : next })
          }
        >
          <SelectTrigger id="pattern-filter-category" className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All categories</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="pattern-filter-status">Status</Label>
        <Select
          value={value.status ?? ALL_VALUE}
          onValueChange={(next) =>
            onChange({ ...value, status: next === ALL_VALUE ? undefined : (next as PatternStatus) })
          }
        >
          <SelectTrigger id="pattern-filter-status" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
