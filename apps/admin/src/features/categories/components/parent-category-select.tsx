'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategoryFlat } from '../hooks/use-category-flat';

export interface ParentCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  /** Category ids to exclude from the option list — pass the category's
   * own id plus every descendant id (`GET /:id/descendants`) when editing,
   * so an invalid (self/cyclical) parent can never be selected in the
   * first place. The backend is itself "circular-reference safe," but this
   * is a real UX improvement, not just a backstop. */
  excludeIds?: string[];
  /** `<FormControl>` (components/form/form.tsx) is a Radix `Slot` that
   * injects `id`/`aria-describedby`/`aria-invalid` onto its single JSX
   * child by cloning it — since that child here is `<ParentCategorySelect>`
   * itself rather than a raw `<SelectTrigger>`, those props arrive as
   * ordinary rest props and must be forwarded onto the actual trigger, or
   * the field label's `htmlFor` association breaks silently (the exact bug
   * `SettingField` had in Frontend Milestone 4 — see
   * docs/64_FRONTEND_SETTINGS.md "Testing").
   */
  [key: string]: any;
}

const ROOT_VALUE = '__root__';

/** `GET /categories/flat` — same endpoint/permission caveat as the
 * Articles milestone's category selector. */
export function ParentCategorySelect({
  value,
  onChange,
  onBlur,
  disabled,
  excludeIds = [],
  ...rest
}: ParentCategorySelectProps) {
  const { data, isError } = useCategoryFlat();

  if (isError) {
    return <p className="text-sm text-muted-foreground">You don&apos;t have permission to view categories.</p>;
  }

  const excluded = new Set(excludeIds);
  const options = (data ?? []).filter((category) => !excluded.has(category.id));

  return (
    <Select
      value={value || ROOT_VALUE}
      onValueChange={(next) => onChange(next === ROOT_VALUE ? '' : next)}
      disabled={disabled || !data}
    >
      <SelectTrigger onBlur={onBlur} {...rest}>
        <SelectValue placeholder="No parent (root level)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ROOT_VALUE}>No parent (root level)</SelectItem>
        {options.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
