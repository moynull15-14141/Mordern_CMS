import { SettingsService } from './settings.service';
import { PublicSettingsService } from './public-settings.service';
import { SettingValueSource } from '../dto/setting-response.dto';
import { SettingCategory } from '../enums/setting-category.enum';
import { buildSettingKey } from '../interfaces/setting-definition.interface';

function buildService() {
  const settingsService = {
    getByKey: jest.fn(),
  } as unknown as SettingsService;
  const service = new PublicSettingsService(settingsService);
  return { service, settingsService };
}

describe('PublicSettingsService', () => {
  it('resolves every allowlisted key through SettingsService.getByKey', async () => {
    const { service, settingsService } = buildService();
    (settingsService.getByKey as jest.Mock).mockImplementation(async (key: string) => ({
      key,
      category: SettingCategory.GENERAL,
      type: 'STRING',
      label: `Label for ${key}`,
      value: `value-for-${key}`,
      source: SettingValueSource.DEFAULT,
      isReadOnly: false,
      isHidden: false,
      isEncrypted: false,
    }));

    const result = await service.getPublicSettings();

    const siteNameKey = buildSettingKey(SettingCategory.GENERAL, 'siteName');
    expect(settingsService.getByKey).toHaveBeenCalledWith(siteNameKey);
    const siteNameEntry = result.find((entry) => entry.key === siteNameKey);
    expect(siteNameEntry).toEqual({
      key: siteNameKey,
      label: `Label for ${siteNameKey}`,
      value: `value-for-${siteNameKey}`,
    });
  });

  it('never calls getByKey for the sensitive analytics.trackingId key (isHidden: true)', async () => {
    const { service, settingsService } = buildService();
    (settingsService.getByKey as jest.Mock).mockResolvedValue({
      key: 'x',
      category: SettingCategory.GENERAL,
      type: 'STRING',
      label: 'x',
      value: 'x',
      source: SettingValueSource.DEFAULT,
      isReadOnly: false,
      isHidden: false,
      isEncrypted: false,
    });

    await service.getPublicSettings();

    const trackingIdKey = buildSettingKey(SettingCategory.ANALYTICS, 'trackingId');
    expect(settingsService.getByKey).not.toHaveBeenCalledWith(trackingIdKey);
  });

  it('never returns admin-only fields (category/type/source/isReadOnly/isHidden/isEncrypted)', async () => {
    const { service, settingsService } = buildService();
    (settingsService.getByKey as jest.Mock).mockResolvedValue({
      key: buildSettingKey(SettingCategory.GENERAL, 'siteName'),
      category: SettingCategory.GENERAL,
      type: 'STRING',
      label: 'Site Name',
      value: 'SportingSpy',
      source: SettingValueSource.DATABASE,
      isReadOnly: false,
      isHidden: false,
      isEncrypted: false,
    });

    const result = await service.getPublicSettings();
    const entry = result[0] as unknown as Record<string, unknown>;

    expect(entry).not.toHaveProperty('category');
    expect(entry).not.toHaveProperty('type');
    expect(entry).not.toHaveProperty('source');
    expect(entry).not.toHaveProperty('isReadOnly');
    expect(entry).not.toHaveProperty('isHidden');
    expect(entry).not.toHaveProperty('isEncrypted');
  });

  it('the allowlist itself never names a known secret/password key', async () => {
    // Complements is-setting-public-safe.util.spec.ts (which tests the
    // defense-in-depth gate in isolation) by asserting the allowlist
    // composition never even attempts to request a sensitive key.
    const { service, settingsService } = buildService();
    (settingsService.getByKey as jest.Mock).mockResolvedValue({
      key: 'x',
      category: SettingCategory.GENERAL,
      type: 'STRING',
      label: 'x',
      value: 'x',
      source: SettingValueSource.DEFAULT,
      isReadOnly: false,
      isHidden: false,
      isEncrypted: false,
    });

    await service.getPublicSettings();

    const calledKeys = (settingsService.getByKey as jest.Mock).mock.calls.map(
      (call: unknown[]) => call[0]
    );
    expect(calledKeys).not.toContain(buildSettingKey(SettingCategory.EMAIL, 'providerApiKey'));
    expect(calledKeys).not.toContain(buildSettingKey(SettingCategory.AI, 'apiKey'));
    expect(calledKeys).not.toContain(buildSettingKey(SettingCategory.STORAGE, 'secretAccessKey'));
  });
});
