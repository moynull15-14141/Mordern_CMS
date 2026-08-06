import { Switch } from '@/components/ui/switch';
import type { FieldProps } from './field.types';

export function BooleanField({ descriptor, value, onChange }: FieldProps) {
  return (
    <Switch
      id={`field-${descriptor.key}`}
      checked={value === true}
      onCheckedChange={(checked) => onChange(checked)}
      aria-label={descriptor.label}
    />
  );
}
