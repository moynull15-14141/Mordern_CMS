import { SettingCategory } from '../enums/setting-category.enum';
import { SettingType } from '../enums/setting-type.enum';
import { SettingResponseDto, SettingValueSource } from './setting-response.dto';

describe('SettingResponseDto shape', () => {
  it('holds every field a resolved setting needs', () => {
    const dto: SettingResponseDto = {
      key: 'security.mfaRequired',
      category: SettingCategory.SECURITY,
      type: SettingType.BOOLEAN,
      label: 'Require MFA',
      description: 'Whether multi-factor auth is required.',
      value: true,
      source: SettingValueSource.ENVIRONMENT,
      isReadOnly: true,
      isHidden: false,
      isEncrypted: false,
    };
    expect(dto.key).toBe('security.mfaRequired');
    expect(dto.source).toBe(SettingValueSource.ENVIRONMENT);
    expect(dto.isReadOnly).toBe(true);
  });

  it('description is optional', () => {
    const dto: SettingResponseDto = {
      key: 'general.siteName',
      category: SettingCategory.GENERAL,
      type: SettingType.STRING,
      label: 'Site Name',
      value: 'My Site',
      source: SettingValueSource.DEFAULT,
      isReadOnly: false,
      isHidden: false,
      isEncrypted: false,
    };
    expect(dto.description).toBeUndefined();
  });

  it('value is redacted to null for encrypted/secret settings, per the documented redaction rule', () => {
    const dto: SettingResponseDto = {
      key: 'email.smtpPassword',
      category: SettingCategory.EMAIL,
      type: SettingType.SECRET,
      label: 'SMTP Password',
      value: null,
      source: SettingValueSource.DATABASE,
      isReadOnly: false,
      isHidden: false,
      isEncrypted: true,
    };
    expect(dto.value).toBeNull();
    expect(dto.isEncrypted).toBe(true);
  });
});

describe('SettingValueSource enum', () => {
  it('covers all four tiers of the frozen priority chain', () => {
    expect(Object.values(SettingValueSource).sort()).toEqual(
      ['DATABASE', 'DEFAULT', 'ENVIRONMENT', 'RUNTIME_OVERRIDE'].sort()
    );
  });
});
