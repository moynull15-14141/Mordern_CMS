'use client';

import type { ControllerRenderProps } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PasswordInput } from '@/components/ui/password-input';
import type { SettingType } from '../types/settings';

export interface SettingFieldProps {
  type: SettingType;
  /** Sensitive types (`PASSWORD`/`SECRET`) render as an empty field with
   * this placeholder — the backend never returns the real value to redraw
   * into the input (mappers/settings.mapper.ts redaction), so the field
   * starts blank and "leave blank to keep unchanged" is the only safe UX
   * (docs/64_FRONTEND_SETTINGS.md "Sensitive Values"). */
  isSensitive: boolean;
  field: ControllerRenderProps<any, string>;
  /** `<FormControl>` (components/form/form.tsx) is a Radix `Slot` that
   * injects `id`/`aria-describedby`/`aria-invalid` onto its single JSX
   * child by cloning it — since that child here is `<SettingField>` itself
   * rather than a raw `<Input>`, those props arrive as ordinary rest props
   * and must be explicitly forwarded onto whichever leaf element actually
   * renders, or the field label's `htmlFor` association breaks silently. */
  [key: string]: any;
}

/** One input per `SettingType` — mirrors `SettingsValidator.assertType()`'s
 * type switch exactly, not a generic text box for everything. Only used for
 * editable (non-`isReadOnly`) settings — read-only settings render as a
 * plain `SettingValueDisplay` instead, outside RHF entirely (see
 * `CategorySettingsForm`). `JSON`/`ARRAY` are edited as raw text (a
 * textarea) since there's no schema-driven object/array builder in scope
 * for this milestone; the value is coerced back to its real shape in
 * `CategorySettingsForm`'s submit handler, not on every keystroke. */
export function SettingField({ type, isSensitive, field, ...rest }: SettingFieldProps) {
  if (isSensitive) {
    return (
      <PasswordInput
        {...field}
        {...rest}
        value={field.value ?? ''}
        placeholder="Leave blank to keep unchanged"
        autoComplete="new-password"
      />
    );
  }

  switch (type) {
    case 'BOOLEAN':
      return (
        <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} onBlur={field.onBlur} {...rest} />
      );
    case 'TEXT':
    case 'JSON':
    case 'ARRAY':
      return <Textarea {...field} {...rest} value={field.value ?? ''} rows={4} />;
    case 'NUMBER':
      return <Input {...field} {...rest} value={field.value ?? ''} type="number" />;
    case 'EMAIL':
      return <Input {...field} {...rest} value={field.value ?? ''} type="email" />;
    case 'URL':
      return <Input {...field} {...rest} value={field.value ?? ''} type="url" />;
    case 'COLOR':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(field.value ?? '') ? field.value : '#000000'}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            className="h-9 w-9 rounded-sm border border-input"
            aria-label="Pick a color"
          />
          <Input {...field} {...rest} value={field.value ?? ''} placeholder="#0f172a" />
        </div>
      );
    case 'STRING':
    case 'FILE_REFERENCE':
    default:
      return <Input {...field} {...rest} value={field.value ?? ''} />;
  }
}
