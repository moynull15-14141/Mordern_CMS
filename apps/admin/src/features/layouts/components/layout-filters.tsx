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
import { STATUS_OPTIONS } from '../constants/layout.constants';
import type { LayoutStatus } from '../types/layout';

export interface LayoutFiltersValue {
  status?: LayoutStatus;
}

export interface LayoutFiltersProps {
  value: LayoutFiltersValue;
  onChange: (value: LayoutFiltersValue) => void;
}

const ALL_VALUE = '__all__';

/** Status maps directly onto the real `LayoutQueryDto.status` field. */
export function LayoutFilters({ value, onChange }: LayoutFiltersProps) {
  const hasActiveFilters = Boolean(value.status);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="layout-filter-status">Status</Label>
        <Select
          value={value.status ?? ALL_VALUE}
          onValueChange={(next) =>
            onChange({ ...value, status: next === ALL_VALUE ? undefined : (next as LayoutStatus) })
          }
        >
          <SelectTrigger id="layout-filter-status" className="w-40">
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
