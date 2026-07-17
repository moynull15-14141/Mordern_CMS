import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { SettingCategory } from '../../modules/settings/enums/setting-category.enum';
import { buildSettingKey } from '../../modules/settings/interfaces/setting-definition.interface';
import { SETTING_DEFINITION_MAP } from '../../modules/settings/settings.constants';
import { SettingsService } from '../../modules/settings/services/settings.service';
import { FeatureFlagName, FeatureFlags } from './feature-flags.interface';

/**
 * Feature toggles, now resolved through the Settings foundation (Milestone
 * 6) instead of `FEATURE_*_ENABLED` env vars alone — runtime configurable
 * via `PUT /settings/category/feature_flags`. Each flag's env var remains
 * the fallback tier when no database override exists (Settings priority
 * chain: Runtime Override -> Environment Variable -> Database Setting ->
 * System Default). This reverses the storage rejection in
 * `35_ARCHITECTURE_FREEZE.md`'s "Rejected Audit Suggestions" without adding
 * a new `feature_flags` table — flags are Settings rows under the existing
 * frozen `Setting` table (see docs/39_SETTINGS_ARCHITECTURE.md).
 */
@Injectable()
export class FeatureFlagsService {
  constructor(
    private readonly config: AppConfigService,
    private readonly settingsService: SettingsService
  ) {}

  async getAll(): Promise<FeatureFlags> {
    const flagNames = Object.keys(this.config.features) as FeatureFlagName[];
    const entries = await Promise.all(
      flagNames.map(async (flag) => [flag, await this.isEnabled(flag)] as const)
    );
    return Object.fromEntries(entries) as unknown as FeatureFlags;
  }

  async isEnabled(flag: FeatureFlagName): Promise<boolean> {
    const definition = SETTING_DEFINITION_MAP.get(
      buildSettingKey(SettingCategory.FEATURE_FLAGS, flag)
    );
    if (!definition) {
      // Should not happen — every FeatureFlags key has a matching registry
      // entry — but falls back to the env-only value rather than throwing.
      return this.config.features[flag];
    }
    const { value } = await this.settingsService.resolveValue(definition);
    return Boolean(value);
  }
}
