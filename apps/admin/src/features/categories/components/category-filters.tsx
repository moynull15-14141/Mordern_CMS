'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_OPTIONS } from '../constants/category.constants';
import type { CategoryStatus } from '../types/category';

export interface CategoryFiltersValue {
  status?: CategoryStatus;
}

export interface CategoryFiltersProps {
  value: CategoryFiltersValue;
  onChange: (value: CategoryFiltersValue) => void;
}

const ALL_VALUE = '__all__';

/** Maps directly onto `CategoryQueryDto.status`. */
export function CategoryFilters({ value, onChange }: CategoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="category-filter-status">Status</Label>
        <Select
          value={value.status ?? ALL_VALUE}
          onValueChange={(next) => onChange({ status: next === ALL_VALUE ? undefined : (next as CategoryStatus) })}
        >
          <SelectTrigger id="category-filter-status" className="w-40">
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

      {value.status ? (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
