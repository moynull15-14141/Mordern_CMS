'use client';

import { Input } from '@/components/ui/input';
import { HEX_COLOR_PATTERN } from '../schemas/theme-settings.schema';

export interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
}

/** Swatch + hex text input — no color-picker primitive exists in the
 * design system yet, so this pairs a native `<input type="color">` (swatch)
 * with the existing `Input` (hex text), matching the backend's own
 * `HEX_COLOR_PATTERN` validation. The swatch only drives the text value
 * when it's itself a valid 6-digit hex (native color inputs never produce
 * 3-digit shorthand), so typing a 3-digit hex directly in the text field
 * is not fought by the swatch's onChange. */
export function ColorInput({ value, onChange, onBlur, id }: ColorInputProps) {
  const swatchValue = HEX_COLOR_PATTERN.test(value) && value.length === 7 ? value : '#000000';

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="Pick color"
        value={swatchValue}
        onChange={(e) => onChange(e.target.value)}
        className="size-9 shrink-0 cursor-pointer rounded-sm border border-input bg-transparent p-0.5"
      />
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="#1a2b3c"
        className="font-mono"
      />
    </div>
  );
}
