/**
 * Future encryption tier for settings flagged `isEncrypted: true`
 * (`SettingDefinition.isEncrypted`). Interface only — per this milestone's
 * explicit instruction, DO NOT implement encryption. No DI provider is
 * registered; encrypted-flagged settings are stored and read as plain JSON
 * today, with sensitive types (PASSWORD/SECRET) redacted at the read/export
 * boundary instead (see `SENSITIVE_SETTING_TYPES` in setting-type.enum.ts).
 */
export interface SettingsEncryptionInterface {
  encrypt(plainValue: string): Promise<string>;
  decrypt(encryptedValue: string): Promise<string>;
}
