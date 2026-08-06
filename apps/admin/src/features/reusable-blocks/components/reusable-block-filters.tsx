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
import { listBlockDefinitions } from '@/features/block-editor';

export interface ReusableBlockFiltersValue {
  blockType?: string;
}

export interface ReusableBlockFiltersProps {
  value: ReusableBlockFiltersValue;
  onChange: (value: ReusableBlockFiltersValue) => void;
}

const ALL_VALUE = '__all__';

/** `blockType` maps directly onto `ReusableBlockQueryDto.blockType` — the
 * option list comes from the Block Editor's own registry (the same
 * source of truth the picker/canvas use), not a hardcoded list, so a
 * future builder's registered type shows up here automatically. */
export function ReusableBlockFilters({ value, onChange }: ReusableBlockFiltersProps) {
  const hasActiveFilters = Boolean(value.blockType);
  const definitions = listBlockDefinitions();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="reusable-block-filter-type">Block type</Label>
        <Select
          value={value.blockType ?? ALL_VALUE}
          onValueChange={(next) =>
            onChange({ ...value, blockType: next === ALL_VALUE ? undefined : next })
          }
        >
          <SelectTrigger id="reusable-block-filter-type" className="w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All types</SelectItem>
            {definitions.map((definition) => (
              <SelectItem key={definition.type} value={definition.type}>
                {definition.label}
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
