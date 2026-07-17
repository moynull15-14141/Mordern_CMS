import { SettingCategory } from '../enums/setting-category.enum';
import { SettingType } from '../enums/setting-type.enum';
import { SettingDefinition } from '../interfaces/setting-definition.interface';
import { SettingValueSource } from '../dto/setting-response.dto';
import { SettingsMapper } from './settings.mapper';

function buildDefinition(overrides: Partial<SettingDefinition> = {}): SettingDefinition {
  return {
    category: SettingCategory.GENERAL,
    key: 'siteName',
    type: SettingType.STRING,
    label: 'Site Name',
    defaultValue: '',
    ...overrides,
  } as SettingDefinition;
}

describe('SettingsMapper', () => {
  let mapper: SettingsMapper;

  beforeEach(() => {
    mapper = new SettingsMapper();
  });

  it('builds the fully-qualified key from category + key', () => {
    const dto = mapper.toResponseDto(buildDefinition(), 'My Site', SettingValueSource.DATABASE);
    expect(dto.key).toBe('general.siteName');
  });

  it('maps type/label/description/source through unchanged', () => {
    const definition = buildDefinition({ description: 'The public site name.' });
    const dto = mapper.toResponseDto(definition, 'My Site', SettingValueSource.DEFAULT);
    expect(dto.type).toBe(SettingType.STRING);
    expect(dto.label).toBe('Site Name');
    expect(dto.description).toBe('The public site name.');
    expect(dto.source).toBe(SettingValueSource.DEFAULT);
  });

  it('passes through isReadOnly/isHidden/isEncrypted flags, defaulting to false', () => {
    const dto = mapper.toResponseDto(buildDefinition(), 'x', SettingValueSource.DEFAULT);
    expect(dto.isReadOnly).toBe(false);
    expect(dto.isHidden).toBe(false);
    expect(dto.isEncrypted).toBe(false);
  });

  it('coerces truthy flags to real booleans', () => {
    const definition = buildDefinition({ isReadOnly: true, isHidden: true, isEncrypted: true });
    const dto = mapper.toResponseDto(definition, 'x', SettingValueSource.DEFAULT);
    expect(dto.isReadOnly).toBe(true);
    expect(dto.isHidden).toBe(true);
    expect(dto.isEncrypted).toBe(true);
  });

  it('redacts the value to null for a PASSWORD-type setting by default', () => {
    const definition = buildDefinition({ type: SettingType.PASSWORD });
    const dto = mapper.toResponseDto(definition, 'super-secret', SettingValueSource.DATABASE);
    expect(dto.value).toBeNull();
  });

  it('redacts the value to null for a SECRET-type setting by default', () => {
    const definition = buildDefinition({ type: SettingType.SECRET });
    const dto = mapper.toResponseDto(definition, 'api-key-123', SettingValueSource.DATABASE);
    expect(dto.value).toBeNull();
  });

  it('redacts the value to null for a non-sensitive-type setting explicitly marked isEncrypted', () => {
    const definition = buildDefinition({ type: SettingType.STRING, isEncrypted: true });
    const dto = mapper.toResponseDto(definition, 'hidden-value', SettingValueSource.DATABASE);
    expect(dto.value).toBeNull();
  });

  it('reveals the real value for a sensitive type when reveal: true is passed', () => {
    const definition = buildDefinition({ type: SettingType.SECRET });
    const dto = mapper.toResponseDto(definition, 'api-key-123', SettingValueSource.DATABASE, {
      reveal: true,
    });
    expect(dto.value).toBe('api-key-123');
  });

  it('does not redact a non-sensitive setting', () => {
    const dto = mapper.toResponseDto(buildDefinition(), 'My Site', SettingValueSource.DATABASE);
    expect(dto.value).toBe('My Site');
  });
});
