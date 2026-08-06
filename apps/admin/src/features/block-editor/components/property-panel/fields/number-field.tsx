import { Input } from '@/components/ui/input';
import type { FieldProps } from './field.types';

export function NumberField({ descriptor, value, onChange }: FieldProps) {
  return (
    <Input
      id={`field-${descriptor.key}`}
      type="number"
      value={typeof value === 'number' ? value : ''}
      onChange={(event) => {
        const raw = event.target.value;
        onChange(raw === '' ? undefined : Number(raw));
      }}
    />
  );
}
