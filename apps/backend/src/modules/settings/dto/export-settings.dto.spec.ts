import { SettingCategory } from '../enums/setting-category.enum';
import { SettingType } from '../enums/setting-type.enum';
import { ExportSettingsDto } from './export-settings.dto';
import { SettingResponseDto, SettingValueSource } from './setting-response.dto';

describe('ExportSettingsDto shape', () => {
  it('holds an exportedAt timestamp and a list of setting response DTOs', () => {
    const setting: SettingResponseDto = {
      key: 'general.siteName',
      category: SettingCategory.GENERAL,
      type: SettingType.STRING,
      label: 'Site Name',
      value: 'My Site',
      source: SettingValueSource.DATABASE,
      isReadOnly: false,
      isHidden: false,
      isEncrypted: false,
    };
    const dto: ExportSettingsDto = { exportedAt: '2026-01-01T00:00:00.000Z', settings: [setting] };
    expect(dto.exportedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(dto.settings).toHaveLength(1);
    expect(dto.settings[0].key).toBe('general.siteName');
  });

  it('supports an empty settings list', () => {
    const dto: ExportSettingsDto = { exportedAt: '2026-01-01T00:00:00.000Z', settings: [] };
    expect(dto.settings).toEqual([]);
  });
});
