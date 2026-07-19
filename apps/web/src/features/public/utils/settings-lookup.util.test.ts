import { describe, expect, it } from 'vitest';
import { findSettingValue } from './settings-lookup.util';

const settings = [
  { key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' },
  { key: 'site.maintenanceMode', label: 'Maintenance Mode', value: false },
];

describe('findSettingValue', () => {
  it('returns the value for a present key', () => {
    expect(findSettingValue<string>(settings, 'general.siteName')).toBe('SportingSpy');
  });

  it('returns a falsy-but-present value correctly (not confused with "missing")', () => {
    expect(findSettingValue<boolean>(settings, 'site.maintenanceMode')).toBe(false);
  });

  it('returns undefined for a key not in the list', () => {
    expect(findSettingValue(settings, 'general.adminEmail')).toBeUndefined();
  });

  it('returns undefined when settings is null', () => {
    expect(findSettingValue(null, 'general.siteName')).toBeUndefined();
  });
});
