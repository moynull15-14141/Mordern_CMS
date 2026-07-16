import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { FeatureFlagName, FeatureFlags } from './feature-flags.interface';

/**
 * Config-driven feature toggles (FEATURE_*_ENABLED env vars). No database,
 * no API, no UI — a static, environment-configurable switch that lets every
 * optional module (AI, Search, RSS, Analytics, Comments, Media) be disabled
 * independently. A dynamic/DB-backed feature_flags table was explicitly
 * rejected for V1 (docs/35_ARCHITECTURE_FREEZE.md).
 */
@Injectable()
export class FeatureFlagsService {
  constructor(private readonly config: AppConfigService) {}

  getAll(): FeatureFlags {
    return this.config.features;
  }

  isEnabled(flag: FeatureFlagName): boolean {
    return this.config.features[flag];
  }
}
