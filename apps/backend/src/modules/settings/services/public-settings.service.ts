import { Injectable } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SETTING_DEFINITION_MAP } from '../settings.constants';
import { PUBLIC_SETTING_KEYS } from '../constants/public-settings.constants';
import { isSettingSafeToExpose } from '../utils/is-setting-public-safe.util';
import { PublicSettingResponseDto } from '../dto/public-setting-response.dto';

/**
 * Public read path (Milestone 13.2) — delegates entirely to the existing
 * `SettingsService.getByKey()` for value resolution, reusing the full
 * frozen priority chain (Runtime Override -> Environment Variable ->
 * Database Setting -> System Default) verbatim; this service adds only the
 * allowlist gate and a trim to the public DTO shape.
 *
 * Defense in depth: even a key present in `PUBLIC_SETTING_KEYS` is
 * re-checked against its own live `SettingDefinition` metadata via
 * `isSettingSafeToExpose` before being included — a future edit to the
 * allowlist that accidentally names a sensitive key still cannot leak its
 * value.
 */
@Injectable()
export class PublicSettingsService {
  constructor(private readonly settingsService: SettingsService) {}

  async getPublicSettings(): Promise<PublicSettingResponseDto[]> {
    const safeKeys = PUBLIC_SETTING_KEYS.filter((key) =>
      isSettingSafeToExpose(SETTING_DEFINITION_MAP.get(key))
    );

    const settings = await Promise.all(safeKeys.map((key) => this.settingsService.getByKey(key)));

    return settings.map((setting) => ({
      key: setting.key,
      label: setting.label,
      value: setting.value,
    }));
  }
}
