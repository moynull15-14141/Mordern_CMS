import { AppConfigService } from '../../config/config.service';
import { SettingsService } from '../../modules/settings/services/settings.service';
import { FeatureFlagsService } from './feature-flags.service';

describe('FeatureFlagsService', () => {
  afterEach(() => {
    delete process.env.FEATURE_COMMENTS_ENABLED;
  });

  function buildService(resolvedValue: unknown) {
    const config = {
      features: {
        ai: false,
        comments: true,
        rss: true,
        search: true,
        analytics: false,
        media: true,
      },
    } as unknown as AppConfigService;
    const settingsService = {
      resolveValue: jest.fn().mockResolvedValue({ value: resolvedValue, source: 'DEFAULT' }),
    } as unknown as SettingsService;
    return { service: new FeatureFlagsService(config, settingsService), settingsService };
  }

  it('isEnabled resolves through SettingsService for a known flag', async () => {
    const { service, settingsService } = buildService(true);
    const result = await service.isEnabled('comments');
    expect(settingsService.resolveValue).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('getAll resolves every flag through SettingsService', async () => {
    const { service } = buildService(false);
    const result = await service.getAll();
    expect(Object.keys(result)).toEqual(['ai', 'comments', 'rss', 'search', 'analytics', 'media']);
    expect(result.comments).toBe(false);
  });
});
