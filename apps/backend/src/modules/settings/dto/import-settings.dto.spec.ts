import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  ImportSettingEntryDto,
  ImportSettingsDto,
  ImportSettingsResultDto,
} from './import-settings.dto';

describe('ImportSettingEntryDto validation', () => {
  it('accepts a valid entry with a fully-qualified key', async () => {
    const dto = plainToInstance(ImportSettingEntryDto, { key: 'general.siteName', value: 'A' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a missing key', async () => {
    const dto = plainToInstance(ImportSettingEntryDto, { value: 'x' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'key')).toBe(true);
  });

  it('rejects a non-string key', async () => {
    const dto = plainToInstance(ImportSettingEntryDto, { key: 123, value: 'x' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'key')).toBe(true);
  });
});

describe('ImportSettingsDto validation', () => {
  it('accepts a valid list of entries', async () => {
    const dto = plainToInstance(ImportSettingsDto, {
      settings: [{ key: 'general.siteName', value: 'A' }],
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts an empty settings array', async () => {
    const dto = plainToInstance(ImportSettingsDto, { settings: [] });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a missing settings array', async () => {
    const dto = plainToInstance(ImportSettingsDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'settings')).toBe(true);
  });

  it('rejects a nested entry missing its key', async () => {
    const dto = plainToInstance(ImportSettingsDto, { settings: [{ value: 'x' }] });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'settings')).toBe(true);
  });
});

describe('ImportSettingsResultDto shape', () => {
  it('holds imported/skipped counts and skipped keys', () => {
    const result: ImportSettingsResultDto = { imported: 3, skipped: 1, skippedKeys: ['bad.key'] };
    expect(result.imported).toBe(3);
    expect(result.skipped).toBe(1);
    expect(result.skippedKeys).toEqual(['bad.key']);
  });
});
