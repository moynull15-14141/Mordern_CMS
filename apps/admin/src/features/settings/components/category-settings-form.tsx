'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SettingField } from './setting-field';
import { SettingValueDisplay } from './setting-value-display';
import { buildSettingValueSchema } from '../schemas/setting-value.schema';
import { SENSITIVE_SETTING_TYPES, SETTING_SOURCE_LABELS } from '../constants/settings.constants';
import type { Setting, SettingEntry, SettingType } from '../types/settings';

export interface CategorySettingsFormProps {
  settings: Setting[];
  onSubmit: (entries: SettingEntry[]) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

/** `Setting.key` is fully-qualified (`"general.siteName"`,
 * `buildSettingKey()` on the backend); `BulkUpdateSettingsDto`'s
 * `SettingEntryDto.key` is the unqualified remainder (`"siteName"`) — this
 * strips the `"<category>."` prefix that every setting in one category form
 * shares, which also doubles as a safe RHF field name (no embedded dots
 * that RHF would otherwise parse as a nested path). */
function unqualifiedKey(setting: Pick<Setting, 'key' | 'category'>): string {
  return setting.key.slice(setting.category.length + 1);
}

function toFieldDefault(setting: Setting): unknown {
  if (SENSITIVE_SETTING_TYPES.has(setting.type)) return '';
  if (setting.type === 'JSON') return setting.value == null ? '' : JSON.stringify(setting.value, null, 2);
  if (setting.type === 'ARRAY') return Array.isArray(setting.value) ? setting.value.join('\n') : '';
  if (setting.type === 'BOOLEAN') return Boolean(setting.value);
  return setting.value ?? '';
}

/** JSON/ARRAY are edited as raw text (see `SettingField`) — their RHF-level
 * schema is a permissive string; real shape validation (valid JSON, etc.)
 * happens in the submit handler below, where the raw text is actually
 * parsed back into its domain shape. */
function fieldSchemaFor(type: SettingType) {
  if (type === 'JSON' || type === 'ARRAY') return z.string();
  return buildSettingValueSchema(type);
}

/**
 * Renders every EDITABLE setting in one category as a single form,
 * bulk-submitted via `PUT /settings/category/:category` in one request —
 * there is no per-field save action (docs/64_FRONTEND_SETTINGS.md
 * "Edit Setting"). `isReadOnly` settings render as plain read-only rows,
 * entirely outside RHF — never part of the schema, defaults, or submit
 * payload. Sensitive fields (`PASSWORD`/`SECRET`) start blank and are only
 * included in the payload when the user actually types a new value
 * ("leave blank to keep unchanged" — the backend never returns their real
 * value to prefill).
 */
export function CategorySettingsForm({
  settings,
  onSubmit,
  isSubmitting,
  submitError,
  onDirtyChange,
}: CategorySettingsFormProps) {
  const editableSettings = settings.filter((setting) => !setting.isReadOnly);
  const readOnlySettings = settings.filter((setting) => setting.isReadOnly);

  const schema = z.object(
    Object.fromEntries(editableSettings.map((setting) => [unqualifiedKey(setting), fieldSchemaFor(setting.type)]))
  );
  const defaultValues = Object.fromEntries(
    editableSettings.map((setting) => [unqualifiedKey(setting), toFieldDefault(setting)])
  );

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function handleSubmit(values: Record<string, unknown>) {
    const entries: SettingEntry[] = [];

    for (const setting of editableSettings) {
      const key = unqualifiedKey(setting);
      const raw = values[key];

      if (SENSITIVE_SETTING_TYPES.has(setting.type)) {
        if (typeof raw === 'string' && raw.length > 0) entries.push({ key, value: raw });
        continue;
      }

      if (setting.type === 'JSON') {
        if (typeof raw !== 'string' || raw.trim() === '') continue;
        try {
          entries.push({ key, value: JSON.parse(raw) });
        } catch {
          form.setError(key, { message: 'Must be valid JSON.' });
        }
        continue;
      }

      if (setting.type === 'ARRAY') {
        const items = typeof raw === 'string' ? raw.split('\n').map((item) => item.trim()).filter(Boolean) : [];
        entries.push({ key, value: items });
        continue;
      }

      entries.push({ key, value: raw as SettingEntry['value'] });
    }

    if (Object.keys(form.formState.errors).length > 0) return;
    onSubmit(entries);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        {readOnlySettings.map((setting) => (
          <div key={setting.key} className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              {setting.label}
              <Badge variant="outline">Read-only</Badge>
            </div>
            {setting.description ? <p className="text-sm text-muted-foreground">{setting.description}</p> : null}
            <SettingValueDisplay setting={setting} />
          </div>
        ))}

        {editableSettings.map((setting) => {
          const key = unqualifiedKey(setting);
          const isSensitive = SENSITIVE_SETTING_TYPES.has(setting.type);
          return (
            <FormField
              key={setting.key}
              control={form.control}
              name={key}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {setting.label}
                    <Badge variant="outline">{SETTING_SOURCE_LABELS[setting.source]}</Badge>
                  </FormLabel>
                  {setting.description ? <FormDescription>{setting.description}</FormDescription> : null}
                  <FormControl>
                    <SettingField type={setting.type} isSensitive={isSensitive} field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}

        {editableSettings.length > 0 ? (
          <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting || !form.formState.isDirty}>
            Save changes
          </FormSubmitButton>
        ) : null}
      </form>
    </Form>
  );
}
