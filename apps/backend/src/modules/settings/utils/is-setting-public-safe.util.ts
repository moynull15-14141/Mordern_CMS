import { SettingDefinition } from '../interfaces/setting-definition.interface';
import { SENSITIVE_SETTING_TYPES } from '../enums/setting-type.enum';

/**
 * Defense-in-depth gate for `PublicSettingsService` — re-checks a
 * definition's own metadata (`isHidden`/`isEncrypted`/sensitive `type`)
 * even for a key already present in the `PUBLIC_SETTING_KEYS` allowlist,
 * so a future allowlist edit that accidentally names a sensitive key still
 * cannot leak its value. Exported as a standalone pure function so this
 * rule is directly unit-testable independent of whatever keys the
 * allowlist currently happens to contain.
 */
export function isSettingSafeToExpose(definition: SettingDefinition | undefined): boolean {
  if (!definition) return false;
  if (definition.isHidden) return false;
  if (definition.isEncrypted) return false;
  if (SENSITIVE_SETTING_TYPES.has(definition.type)) return false;
  return true;
}
