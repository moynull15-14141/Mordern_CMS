import { SettingCategory } from '../enums/setting-category.enum';
import { SettingsService } from '../services/settings.service';
import { SettingsController } from './settings.controller';

function buildController() {
  const settingsService = {
    getAll: jest.fn().mockResolvedValue([]),
    getByCategory: jest.fn().mockResolvedValue([]),
    getByKey: jest.fn().mockResolvedValue({}),
    updateSetting: jest.fn().mockResolvedValue({}),
    bulkUpdateCategory: jest.fn().mockResolvedValue([]),
    importSettings: jest.fn().mockResolvedValue({ imported: 0, skipped: 0, skippedKeys: [] }),
    resetAll: jest.fn().mockResolvedValue(3),
    resetCategory: jest.fn().mockResolvedValue(2),
    exportSettings: jest.fn().mockResolvedValue({ exportedAt: '', settings: [] }),
  } as unknown as SettingsService;
  const controller = new SettingsController(settingsService);
  return { controller, settingsService };
}

const user = { id: 'user-1' } as never;

describe('SettingsController', () => {
  it('getAll delegates to SettingsService.getAll', async () => {
    const { controller, settingsService } = buildController();
    await controller.getAll();
    expect(settingsService.getAll).toHaveBeenCalled();
  });

  it('getByCategory delegates with the category param', async () => {
    const { controller, settingsService } = buildController();
    await controller.getByCategory(SettingCategory.SECURITY);
    expect(settingsService.getByCategory).toHaveBeenCalledWith(SettingCategory.SECURITY);
  });

  it('getByKey delegates with the dotted key', async () => {
    const { controller, settingsService } = buildController();
    await controller.getByKey('general.siteName');
    expect(settingsService.getByKey).toHaveBeenCalledWith('general.siteName');
  });

  it('updateSetting passes value and actor id through', async () => {
    const { controller, settingsService } = buildController();
    await controller.updateSetting('general.siteName', { value: 'Acme' }, user);
    expect(settingsService.updateSetting).toHaveBeenCalledWith(
      'general.siteName',
      'Acme',
      undefined,
      'user-1'
    );
  });

  it('bulkUpdateCategory passes entries and actor id through', async () => {
    const { controller, settingsService } = buildController();
    const entries = [{ key: 'siteName', value: 'Acme' }];
    await controller.bulkUpdateCategory(SettingCategory.GENERAL, { settings: entries }, user);
    expect(settingsService.bulkUpdateCategory).toHaveBeenCalledWith(
      SettingCategory.GENERAL,
      entries,
      undefined,
      'user-1'
    );
  });

  it('importSettings delegates with entries and actor id', async () => {
    const { controller, settingsService } = buildController();
    const entries = [{ key: 'general.siteName', value: 'Acme' }];
    await controller.importSettings({ settings: entries }, user);
    expect(settingsService.importSettings).toHaveBeenCalledWith(entries, undefined, 'user-1');
  });

  it('resetAll wraps the count in a ResetResultDto', async () => {
    const { controller } = buildController();
    const result = await controller.resetAll(user);
    expect(result).toEqual({ resetCount: 3 });
  });

  it('resetCategory wraps the count in a ResetResultDto', async () => {
    const { controller, settingsService } = buildController();
    const result = await controller.resetCategory({ category: SettingCategory.SECURITY }, user);
    expect(settingsService.resetCategory).toHaveBeenCalledWith(
      SettingCategory.SECURITY,
      undefined,
      'user-1'
    );
    expect(result).toEqual({ resetCount: 2 });
  });

  it('exportSettings delegates to SettingsService.exportSettings', async () => {
    const { controller, settingsService } = buildController();
    await controller.exportSettings();
    expect(settingsService.exportSettings).toHaveBeenCalled();
  });
});
