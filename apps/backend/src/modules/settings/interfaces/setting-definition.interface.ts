import { SettingCategory } from '../enums/setting-category.enum';
import { SettingType } from '../enums/setting-type.enum';
import { SettingValidationRule } from './setting-validation-rule.interface';
import { SettingValue } from './setting-value.type';

/**
 * Static, code-level metadata for one setting. Never persisted — the
 * database (`Setting.value`) only ever stores an override for a definition
 * that lives here. Category + key together are the definition's identity and
 * map onto the frozen `Setting.namespace`/`Setting.key` columns.
 */
export interface SettingDefinition {
  category: SettingCategory;
  key: string;
  type: SettingType;
  label: string;
  description?: string;
  defaultValue: SettingValue;
  validation?: SettingValidationRule;
  /** Matching `config/env/*.env` variable this setting mirrors, if any —
   * consulted as the Environment Variable priority tier. */
  envKey?: string;
  isReadOnly?: boolean;
  isHidden?: boolean;
  /** Marks a setting as requiring encryption at rest. No encryption is
   * implemented in this milestone (see SettingsEncryptionProvider) — this
   * flag only records intent and drives redaction in read/export paths. */
  isEncrypted?: boolean;
}

/** Fully-qualified, dotted identity for a setting definition — the same
 * `resource.action`-style convention already used for permission keys
 * (`38_RBAC_ARCHITECTURE.md`), applied here as `category.key`. */
export function buildSettingKey(category: SettingCategory, key: string): string {
  return `${category}.${key}`;
}
