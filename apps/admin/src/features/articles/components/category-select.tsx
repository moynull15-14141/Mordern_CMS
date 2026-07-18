'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategoryOptions } from '../hooks/use-category-options';

export interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const NONE_VALUE = '__none__';

/** `GET /categories/flat` — gated by `category.create` on the backend (no
 * `category.view` permission exists); a viewer without it sees this
 * selector disabled with an explanatory message rather than a silent
 * empty list. */
export function CategorySelect({ value, onChange, onBlur, disabled }: CategorySelectProps) {
  const { data, isError } = useCategoryOptions();

  if (isError) {
    return <p className="text-sm text-muted-foreground">You don&apos;t have permission to view categories.</p>;
  }

  return (
    <Select
      value={value || NONE_VALUE}
      onValueChange={(next) => onChange(next === NONE_VALUE ? '' : next)}
      disabled={disabled || !data}
    >
      <SelectTrigger onBlur={onBlur}>
        <SelectValue placeholder="No category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>No category</SelectItem>
        {data?.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
