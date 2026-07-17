import { plainToInstance } from 'class-transformer';
import { UpdateSettingDto } from './update-setting.dto';

/**
 * `UpdateSettingDto.value` deliberately carries no `class-validator`
 * decorators — the real type check happens against `SettingDefinition.type`
 * in `SettingsValidator`, not statically on this DTO (a setting's value can
 * legitimately be a string, number, boolean, object, array, or null
 * depending on which setting is being written). `class-validator`'s
 * `validate()` special-cases a class with zero decorated properties
 * ("an unknown value was passed"), so this spec checks instantiation shape
 * instead of running `validate()` against it.
 */
describe('UpdateSettingDto', () => {
  it('carries through a string value', () => {
    const dto = plainToInstance(UpdateSettingDto, { value: 'hello' });
    expect(dto.value).toBe('hello');
  });

  it('carries through a numeric value', () => {
    const dto = plainToInstance(UpdateSettingDto, { value: 42 });
    expect(dto.value).toBe(42);
  });

  it('carries through a boolean value', () => {
    const dto = plainToInstance(UpdateSettingDto, { value: true });
    expect(dto.value).toBe(true);
  });

  it('carries through a null value (unset)', () => {
    const dto = plainToInstance(UpdateSettingDto, { value: null });
    expect(dto.value).toBeNull();
  });

  it('carries through an object value (JSON-type settings)', () => {
    const dto = plainToInstance(UpdateSettingDto, { value: { nested: true } });
    expect(dto.value).toEqual({ nested: true });
  });

  it('carries through an array value', () => {
    const dto = plainToInstance(UpdateSettingDto, { value: ['a', 'b'] });
    expect(dto.value).toEqual(['a', 'b']);
  });
});
