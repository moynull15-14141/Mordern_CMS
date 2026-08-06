import { Input } from '@/components/ui/input';
import type { FieldProps } from './field.types';

/** Mirrors `features/themes/components/color-input.tsx`'s pattern
 * (swatch + hex text, no color-picker primitive exists in the design
 * system) — reimplemented here rather than imported, since block-editor
 * cannot depend on the themes feature (or any other feature) without
 * breaking the "standalone framework" boundary. */
const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function ColorField({ descriptor, value, onChange }: FieldProps) {
  const current = typeof value === 'string' ? value : '';
  const swatchValue = HEX_COLOR_PATTERN.test(current) && current.length === 7 ? current : '#000000';

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={`${descriptor.label} swatch`}
        value={swatchValue}
        onChange={(event) => onChange(event.target.value)}
        className="size-9 shrink-0 cursor-pointer rounded-sm border border-input bg-transparent p-0.5"
      />
      <Input
        id={`field-${descriptor.key}`}
        value={current}
        placeholder="#1a2b3c"
        className="font-mono"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
