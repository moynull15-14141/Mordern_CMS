import { z } from 'zod';
import type { SettingType } from '../types/settings';

/**
 * Type-level validation only, mirroring `SettingsValidator.assertType()`
 * (`apps/backend/src/modules/settings/validators/settings.validator.ts`)
 * exactly. `SettingResponseDto` does NOT expose a setting's `validation`
 * rules (min/max/regex/allowedValues/required/nullable) — those live only
 * in the backend's own `SETTING_DEFINITIONS` catalog, which no endpoint
 * returns. Hardcoding a second copy of those rules on the frontend would
 * silently drift from the backend catalog with no way to detect it, so
 * this deliberately validates only what the API response actually
 * describes (`type`) and defers everything else to the backend's own
 * validation error, displayed inline (docs/64_FRONTEND_SETTINGS.md
 * "Validation Strategy").
 */
export function buildSettingValueSchema(type: SettingType): z.ZodType {
  switch (type) {
    case 'NUMBER':
      return z.coerce.number({ invalid_type_error: 'Must be a number.' });
    case 'BOOLEAN':
      return z.boolean();
    case 'ARRAY':
      return z.array(z.string());
    case 'JSON':
      return z.record(z.string(), z.unknown());
    case 'EMAIL':
      return z.union([z.literal(''), z.string().email('Must be a valid email address.')]);
    case 'URL':
      return z.union([z.literal(''), z.string().url('Must be a valid URL.')]);
    case 'COLOR':
      return z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color (e.g. #0f172a).');
    case 'STRING':
    case 'TEXT':
    case 'PASSWORD':
    case 'SECRET':
    case 'FILE_REFERENCE':
    default:
      return z.string();
  }
}
