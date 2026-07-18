import type { Setting } from '../types/settings';
import { SENSITIVE_SETTING_TYPES } from '../constants/settings.constants';

export interface SettingValueDisplayProps {
  setting: Pick<Setting, 'type' | 'value'>;
}

/** Human-readable rendering of a setting's current value — handles the
 * backend's own redaction (`value: null` for PASSWORD/SECRET types except
 * the direct response to that setting's own update, mappers/settings.mapper.ts)
 * by always showing a fixed placeholder for sensitive types rather than
 * ever rendering a literal `null` as "Not set" (which would look like a
 * real empty state instead of "hidden"). */
export function SettingValueDisplay({ setting }: SettingValueDisplayProps) {
  const { type, value } = setting;

  if (SENSITIVE_SETTING_TYPES.has(type)) {
    return <span className="font-mono text-muted-foreground">••••••••</span>;
  }

  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (type === 'BOOLEAN') {
    return <span>{value ? 'Yes' : 'No'}</span>;
  }

  if (type === 'ARRAY' || type === 'JSON') {
    return <span className="font-mono text-xs">{JSON.stringify(value)}</span>;
  }

  return <span>{String(value)}</span>;
}
