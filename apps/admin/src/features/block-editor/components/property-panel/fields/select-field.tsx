import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldProps } from './field.types';

export function SelectField({ descriptor, value, onChange }: FieldProps) {
  const current = typeof value === 'string' ? value : undefined;

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger id={`field-${descriptor.key}`} aria-label={descriptor.label}>
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent>
        {(descriptor.options ?? []).map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
