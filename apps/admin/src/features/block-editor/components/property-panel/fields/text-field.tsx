import { Input } from '@/components/ui/input';
import type { FieldProps } from './field.types';

export function TextField({ descriptor, value, onChange }: FieldProps) {
  return (
    <Input
      id={`field-${descriptor.key}`}
      value={typeof value === 'string' ? value : ''}
      placeholder={descriptor.placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
