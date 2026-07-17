import { SettingCategory } from '../enums/setting-category.enum';
import { SettingType } from '../enums/setting-type.enum';
import { SettingDefinition } from '../interfaces/setting-definition.interface';
import {
  SettingReadOnlyException,
  SettingValidationException,
} from '../exceptions/settings.exceptions';
import { SettingsValidator } from './settings.validator';

function buildDefinition(overrides: Partial<SettingDefinition> = {}): SettingDefinition {
  return {
    category: SettingCategory.GENERAL,
    key: 'testKey',
    type: SettingType.STRING,
    label: 'Test',
    defaultValue: '',
    ...overrides,
  };
}

describe('SettingsValidator', () => {
  const validator = new SettingsValidator();

  describe('assertWritable', () => {
    it('throws SettingReadOnlyException for a read-only definition', () => {
      const definition = buildDefinition({ isReadOnly: true });
      expect(() => validator.assertWritable(definition)).toThrow(SettingReadOnlyException);
    });

    it('does not throw for a writable definition', () => {
      const definition = buildDefinition({ isReadOnly: false });
      expect(() => validator.assertWritable(definition)).not.toThrow();
    });
  });

  describe('type validation', () => {
    it('accepts a valid NUMBER within range', () => {
      const definition = buildDefinition({
        type: SettingType.NUMBER,
        validation: { min: 1, max: 10 },
      });
      expect(() => validator.validate(definition, 5)).not.toThrow();
    });

    it('rejects a NUMBER below min', () => {
      const definition = buildDefinition({
        type: SettingType.NUMBER,
        validation: { min: 1, max: 10 },
      });
      expect(() => validator.validate(definition, 0)).toThrow(SettingValidationException);
    });

    it('rejects a NUMBER above max', () => {
      const definition = buildDefinition({
        type: SettingType.NUMBER,
        validation: { min: 1, max: 10 },
      });
      expect(() => validator.validate(definition, 11)).toThrow(SettingValidationException);
    });

    it('rejects a non-boolean value for BOOLEAN type', () => {
      const definition = buildDefinition({ type: SettingType.BOOLEAN });
      expect(() => validator.validate(definition, 'yes' as unknown as boolean)).toThrow(
        SettingValidationException
      );
    });

    it('accepts a valid BOOLEAN', () => {
      const definition = buildDefinition({ type: SettingType.BOOLEAN });
      expect(() => validator.validate(definition, true)).not.toThrow();
    });

    it('rejects a string not matching regex', () => {
      const definition = buildDefinition({ validation: { regex: '^[a-z]+$' } });
      expect(() => validator.validate(definition, 'ABC123')).toThrow(SettingValidationException);
    });

    it('accepts a string matching regex', () => {
      const definition = buildDefinition({ validation: { regex: '^[a-z]+$' } });
      expect(() => validator.validate(definition, 'abc')).not.toThrow();
    });

    it('rejects a value outside allowedValues', () => {
      const definition = buildDefinition({ validation: { allowedValues: ['a', 'b'] } });
      expect(() => validator.validate(definition, 'c')).toThrow(SettingValidationException);
    });

    it('rejects a required value that is null', () => {
      const definition = buildDefinition({ validation: { required: true } });
      expect(() => validator.validate(definition, null)).toThrow(SettingValidationException);
    });

    it('allows null when nullable and not required', () => {
      const definition = buildDefinition({ validation: { nullable: true } });
      expect(() => validator.validate(definition, null)).not.toThrow();
    });

    it('rejects an invalid EMAIL', () => {
      const definition = buildDefinition({ type: SettingType.EMAIL });
      expect(() => validator.validate(definition, 'not-an-email')).toThrow(
        SettingValidationException
      );
    });

    it('accepts a valid EMAIL', () => {
      const definition = buildDefinition({ type: SettingType.EMAIL });
      expect(() => validator.validate(definition, 'a@b.com')).not.toThrow();
    });

    it('rejects an invalid COLOR', () => {
      const definition = buildDefinition({ type: SettingType.COLOR });
      expect(() => validator.validate(definition, 'red')).toThrow(SettingValidationException);
    });

    it('accepts a valid COLOR', () => {
      const definition = buildDefinition({ type: SettingType.COLOR });
      expect(() => validator.validate(definition, '#123abc')).not.toThrow();
    });

    it('rejects a non-array value for ARRAY type', () => {
      const definition = buildDefinition({ type: SettingType.ARRAY });
      expect(() => validator.validate(definition, 'not-array' as unknown as string[])).toThrow(
        SettingValidationException
      );
    });

    it('accepts a valid ARRAY', () => {
      const definition = buildDefinition({ type: SettingType.ARRAY });
      expect(() => validator.validate(definition, ['a', 'b'])).not.toThrow();
    });
  });
});
