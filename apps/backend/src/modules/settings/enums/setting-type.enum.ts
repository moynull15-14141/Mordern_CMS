/** Value-type vocabulary for a setting's stored `value` (always JSON at rest,
 * per the frozen `Setting.value Json` column). Governs validation and
 * serialization only — never changes the underlying DB column type. */
export enum SettingType {
  STRING = 'STRING',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  ARRAY = 'ARRAY',
  COLOR = 'COLOR',
  URL = 'URL',
  EMAIL = 'EMAIL',
  PASSWORD = 'PASSWORD',
  SECRET = 'SECRET',
  FILE_REFERENCE = 'FILE_REFERENCE',
}

/** Types whose resolved value must never appear verbatim in export output or
 * generic read responses without an explicit reveal — see SettingsService. */
export const SENSITIVE_SETTING_TYPES: ReadonlySet<SettingType> = new Set([
  SettingType.PASSWORD,
  SettingType.SECRET,
]);
