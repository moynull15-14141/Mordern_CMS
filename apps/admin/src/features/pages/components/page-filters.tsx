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
import { STATUS_OPTIONS } from '../constants/page.constants';
import type { ContentStatus } from '../types/page';

export interface PageFiltersValue {
  status?: ContentStatus;
}

export interface PageFiltersProps {
  value: PageFiltersValue;
  onChange: (value: PageFiltersValue) => void;
}

const ALL_VALUE = '__all__';

/** Status maps directly onto the real `PageQueryDto.status` field — no
 * visibility/category/tag/author filter exists on `Page`. */
export function PageFilters({ value, onChange }: PageFiltersProps) {
  const hasActiveFilters = Boolean(value.status);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="page-filter-status">Status</Label>
        <Select
          value={value.status ?? ALL_VALUE}
          onValueChange={(next) =>
            onChange({ ...value, status: next === ALL_VALUE ? undefined : (next as ContentStatus) })
          }
        >
          <SelectTrigger id="page-filter-status" className="w-40">
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

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
