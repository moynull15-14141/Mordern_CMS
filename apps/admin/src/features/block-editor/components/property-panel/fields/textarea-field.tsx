import { Textarea } from '@/components/ui/textarea';
import type { FieldProps } from './field.types';

/** Also used for `kind: 'richtext'` — no rich-text editor library exists
 * anywhere in this codebase yet (a real, separate scope item), so
 * richtext fields fall back to plain multi-line text, same as the
 * backend's own `data.text` shape expects (a plain string, not markup). */
export function TextareaField({ descriptor, value, onChange }: FieldProps) {
  return (
    <Textarea
      id={`field-${descriptor.key}`}
      value={typeof value === 'string' ? value : ''}
      placeholder={descriptor.placeholder}
      rows={4}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
