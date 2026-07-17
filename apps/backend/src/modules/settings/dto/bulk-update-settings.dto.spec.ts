import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BulkUpdateSettingsDto, SettingEntryDto } from './bulk-update-settings.dto';

describe('SettingEntryDto validation', () => {
  it('accepts a valid entry', async () => {
    const dto = plainToInstance(SettingEntryDto, { key: 'siteName', value: 'My Site' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a missing key', async () => {
    const dto = plainToInstance(SettingEntryDto, { value: 'x' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'key')).toBe(true);
  });

  it('rejects a non-string key', async () => {
    const dto = plainToInstance(SettingEntryDto, { key: 123, value: 'x' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'key')).toBe(true);
  });
});

describe('BulkUpdateSettingsDto validation', () => {
  it('accepts a valid list of entries', async () => {
    const dto = plainToInstance(BulkUpdateSettingsDto, {
      settings: [
        { key: 'siteName', value: 'A' },
        { key: 'siteUrl', value: 'B' },
      ],
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts an empty settings array', async () => {
    const dto = plainToInstance(BulkUpdateSettingsDto, { settings: [] });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a missing settings array', async () => {
    const dto = plainToInstance(BulkUpdateSettingsDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'settings')).toBe(true);
  });

  it('rejects a settings entry missing its key (nested validation)', async () => {
    const dto = plainToInstance(BulkUpdateSettingsDto, { settings: [{ value: 'x' }] });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'settings')).toBe(true);
  });

  it('rejects settings that is not an array', async () => {
    const dto = plainToInstance(BulkUpdateSettingsDto, { settings: 'not-an-array' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'settings')).toBe(true);
  });
});
