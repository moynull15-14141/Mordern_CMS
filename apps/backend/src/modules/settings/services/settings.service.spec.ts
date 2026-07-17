import { SettingCategory } from '../enums/setting-category.enum';
import { GLOBAL_SCOPE } from '../enums/setting-scope.enum';
import { SettingsRepository } from '../repositories/settings.repository';
import { SettingsValidator } from '../validators/settings.validator';
import { SettingsMapper } from '../mappers/settings.mapper';
import { SettingValueSource } from '../dto/setting-response.dto';
import {
  SettingNotFoundException,
  SettingReadOnlyException,
} from '../exceptions/settings.exceptions';
import { SettingsService } from './settings.service';

function buildService() {
  const repository = {
    findOne: jest.fn().mockResolvedValue(null),
    upsert: jest.fn(),
    deleteCategoryOverrides: jest.fn(),
    deleteAllOverrides: jest.fn(),
  } as unknown as SettingsRepository;
  const validator = new SettingsValidator();
  const mapper = new SettingsMapper();
  const service = new SettingsService(repository, validator, mapper);
  return { service, repository };
}

describe('SettingsService', () => {
  afterEach(() => {
    delete process.env.FEATURE_AI_ENABLED;
  });

  describe('resolveValue priority chain', () => {
    it('falls back to the system default when no override exists anywhere', async () => {
      const { service } = buildService();
      const result = await service.getByKey('general.siteName');
      expect(result.source).toBe(SettingValueSource.DEFAULT);
      expect(result.value).toBe('Modern CMS');
    });

    it('prefers an environment variable over the system default', async () => {
      process.env.FEATURE_AI_ENABLED = 'true';
      const { service } = buildService();
      const result = await service.getByKey('feature_flags.ai');
      expect(result.source).toBe(SettingValueSource.ENVIRONMENT);
      expect(result.value).toBe(true);
    });

    it('prefers a database setting over the system default when no env var is set', async () => {
      const { service, repository } = buildService();
      (repository.findOne as jest.Mock).mockResolvedValue({ value: true });
      const result = await service.getByKey('feature_flags.analytics');
      expect(result.source).toBe(SettingValueSource.DATABASE);
      expect(result.value).toBe(true);
    });

    it('prefers an environment variable over a database setting (per the frozen priority chain)', async () => {
      process.env.FEATURE_AI_ENABLED = 'true';
      const { service, repository } = buildService();
      (repository.findOne as jest.Mock).mockResolvedValue({ value: false });
      const result = await service.getByKey('feature_flags.ai');
      expect(result.source).toBe(SettingValueSource.ENVIRONMENT);
      expect(result.value).toBe(true);
    });

    it('prefers a runtime override over everything else', async () => {
      process.env.FEATURE_AI_ENABLED = 'true';
      const { service, repository } = buildService();
      (repository.findOne as jest.Mock).mockResolvedValue({ value: false });
      service.setRuntimeOverride('feature_flags.ai', true);
      const result = await service.getByKey('feature_flags.ai');
      expect(result.source).toBe(SettingValueSource.RUNTIME_OVERRIDE);
      expect(result.value).toBe(true);
    });
  });

  describe('getByKey', () => {
    it('throws SettingNotFoundException for an unregistered key', async () => {
      const { service } = buildService();
      await expect(service.getByKey('unknown.key')).rejects.toThrow(SettingNotFoundException);
    });

    it('redacts SECRET-typed values by default', async () => {
      const { service, repository } = buildService();
      (repository.findOne as jest.Mock).mockResolvedValue({ value: 'sk-real-secret' });
      const result = await service.getByKey('ai.apiKey');
      expect(result.value).toBeNull();
    });
  });

  describe('updateSetting', () => {
    it('rejects writes to a read-only setting', async () => {
      const { service } = buildService();
      await expect(service.updateSetting('security.enforceHttps', false)).rejects.toThrow(
        SettingReadOnlyException
      );
    });

    it('validates and persists a writable setting', async () => {
      const { service, repository } = buildService();
      await service.updateSetting('general.siteName', 'New Name', GLOBAL_SCOPE, 'user-1');
      expect(repository.upsert).toHaveBeenCalledWith(
        'general',
        'siteName',
        'New Name',
        GLOBAL_SCOPE,
        'user-1'
      );
    });
  });

  describe('resetCategory / resetAll', () => {
    it('resetCategory delegates to the repository and returns the definition count', async () => {
      const { service, repository } = buildService();
      const count = await service.resetCategory(SettingCategory.GENERAL);
      expect(repository.deleteCategoryOverrides).toHaveBeenCalledWith(
        SettingCategory.GENERAL,
        GLOBAL_SCOPE,
        null
      );
      expect(count).toBeGreaterThan(0);
    });

    it('resetAll delegates to the repository', async () => {
      const { service, repository } = buildService();
      await service.resetAll();
      expect(repository.deleteAllOverrides).toHaveBeenCalledWith(GLOBAL_SCOPE, null);
    });
  });

  describe('importSettings', () => {
    it('skips unknown keys without throwing', async () => {
      const { service } = buildService();
      const result = await service.importSettings([{ key: 'nonexistent.key', value: 'x' }]);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.skippedKeys).toEqual(['nonexistent.key']);
    });

    it('skips read-only keys without throwing', async () => {
      const { service } = buildService();
      const result = await service.importSettings([{ key: 'security.enforceHttps', value: false }]);
      expect(result.imported).toBe(0);
      expect(result.skippedKeys).toEqual(['security.enforceHttps']);
    });

    it('imports a valid, writable key', async () => {
      const { service, repository } = buildService();
      const result = await service.importSettings([
        { key: 'general.siteName', value: 'Imported Name' },
      ]);
      expect(result.imported).toBe(1);
      expect(repository.upsert).toHaveBeenCalledWith(
        'general',
        'siteName',
        'Imported Name',
        GLOBAL_SCOPE,
        null
      );
    });
  });

  describe('exportSettings', () => {
    it('returns every setting with an exportedAt timestamp', async () => {
      const { service } = buildService();
      const result = await service.exportSettings();
      expect(result.exportedAt).toBeTruthy();
      expect(result.settings.length).toBeGreaterThan(0);
    });
  });
});
