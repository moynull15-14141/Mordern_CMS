import { SettingType } from '../enums/setting-type.enum';
import { SettingDefinition } from '../interfaces/setting-definition.interface';
import { SettingCategory } from '../enums/setting-category.enum';
import { isSettingSafeToExpose } from './is-setting-public-safe.util';

function buildDefinition(overrides: Partial<SettingDefinition> = {}): SettingDefinition {
  return {
    category: SettingCategory.GENERAL,
    key: 'siteName',
    type: SettingType.STRING,
    label: 'Site Name',
    defaultValue: '',
    ...overrides,
  };
}

describe('isSettingSafeToExpose', () => {
  it('returns false when the definition is undefined (unknown key)', () => {
    expect(isSettingSafeToExpose(undefined)).toBe(false);
  });

  it('returns true for a plain, non-sensitive STRING definition', () => {
    expect(isSettingSafeToExpose(buildDefinition())).toBe(true);
  });

  it('returns false when isHidden is true, even for an otherwise-safe type', () => {
    expect(isSettingSafeToExpose(buildDefinition({ isHidden: true }))).toBe(false);
  });

  it('returns false when isEncrypted is true', () => {
    expect(isSettingSafeToExpose(buildDefinition({ isEncrypted: true }))).toBe(false);
  });

  it('returns false for type SECRET even if isHidden/isEncrypted are both unset', () => {
    expect(isSettingSafeToExpose(buildDefinition({ type: SettingType.SECRET }))).toBe(false);
  });

  it('returns false for type PASSWORD', () => {
    expect(isSettingSafeToExpose(buildDefinition({ type: SettingType.PASSWORD }))).toBe(false);
  });

  it('returns true for BOOLEAN/NUMBER/URL/EMAIL types with no sensitive flags', () => {
    expect(isSettingSafeToExpose(buildDefinition({ type: SettingType.BOOLEAN }))).toBe(true);
    expect(isSettingSafeToExpose(buildDefinition({ type: SettingType.NUMBER }))).toBe(true);
    expect(isSettingSafeToExpose(buildDefinition({ type: SettingType.URL }))).toBe(true);
    expect(isSettingSafeToExpose(buildDefinition({ type: SettingType.EMAIL }))).toBe(true);
  });
});
