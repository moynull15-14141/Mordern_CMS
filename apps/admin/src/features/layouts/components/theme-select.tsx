'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useThemes } from '@/features/themes';

export interface ThemeSelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  [key: string]: any;
}

const ANY_VALUE = '__any__';

/** "Theme compatibility" — `Layout.themeId`, nullable: unset means
 * "compatible with any theme". `GET /themes` (reused as-is, same endpoint
 * the Themes admin list already calls) — a large page size since this is
 * a plain dropdown, not a searchable picker; theme counts are expected to
 * stay small (mirrors `ParentCategorySelect`'s own "flat list, no search"
 * reasoning for a similarly-sized real dataset). */
export function ThemeSelect({ value, onChange, onBlur, disabled, ...rest }: ThemeSelectProps) {
  const { data, isError } = useThemes({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' });

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        You don&apos;t have permission to view themes.
      </p>
    );
  }

  const themes = data?.data ?? [];

  return (
    <Select
      value={value || ANY_VALUE}
      onValueChange={(next) => onChange(next === ANY_VALUE ? '' : next)}
      disabled={disabled || !data}
    >
      <SelectTrigger onBlur={onBlur} {...rest}>
        <SelectValue placeholder="Compatible with any theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY_VALUE}>Compatible with any theme</SelectItem>
        {themes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
