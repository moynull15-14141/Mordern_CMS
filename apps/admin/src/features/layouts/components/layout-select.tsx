'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLayouts } from '../hooks/use-layouts';

export interface LayoutSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Plain dropdown over `GET /layouts` — layout counts are expected to stay
 * small (mirrors `ThemeSelect`'s own "flat list, no search" reasoning). */
export function LayoutSelect({ value, onChange, disabled }: LayoutSelectProps) {
  const { data, isLoading } = useLayouts({
    page: 1,
    limit: 100,
    status: 'PUBLISHED',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const layouts = data?.data ?? [];

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? 'Loading layouts…' : 'Choose a layout'} />
      </SelectTrigger>
      <SelectContent>
        {layouts.map((layout) => (
          <SelectItem key={layout.id} value={layout.id}>
            {layout.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
