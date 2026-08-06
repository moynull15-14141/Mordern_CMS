import { Input } from '@/components/ui/input';
import type { FieldProps } from './field.types';

export function UrlField({ descriptor, value, onChange }: FieldProps) {
  return (
    <Input
      id={`field-${descriptor.key}`}
      type="url"
      value={typeof value === 'string' ? value : ''}
      placeholder={descriptor.placeholder ?? 'https://…'}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
