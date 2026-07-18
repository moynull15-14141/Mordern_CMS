'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SETTING_CATEGORY_OPTIONS } from '../constants/settings.constants';
import type { SettingCategory } from '../types/settings';

export interface SettingsFiltersValue {
  category?: SettingCategory;
}

export interface SettingsFiltersProps {
  value: SettingsFiltersValue;
  onChange: (value: SettingsFiltersValue) => void;
}

const ALL_VALUE = '__all__';

/** Client-side category filter over the complete 34-entry catalog — no
 * `?category=` query param exists on `GET /settings` (only the separate
 * `GET /settings/category/:category` sub-route), so filtering happens over
 * the already-fetched `useSettings()` result, not a server request. */
export function SettingsFilters({ value, onChange }: SettingsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="settings-filter-category">Category</Label>
        <Select
          value={value.category ?? ALL_VALUE}
          onValueChange={(next) =>
            onChange({ category: next === ALL_VALUE ? undefined : (next as SettingCategory) })
          }
        >
          <SelectTrigger id="settings-filter-category" className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All categories</SelectItem>
            {SETTING_CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.category ? (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
