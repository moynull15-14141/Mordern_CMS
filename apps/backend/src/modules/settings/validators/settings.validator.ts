import { Injectable } from '@nestjs/common';
import { SettingType } from '../enums/setting-type.enum';
import { SettingDefinition, buildSettingKey } from '../interfaces/setting-definition.interface';
import { SettingValue } from '../interfaces/setting-value.type';
import {
  SettingReadOnlyException,
  SettingValidationException,
} from '../exceptions/settings.exceptions';

/**
 * Enforces a `SettingDefinition`'s type + validation rules against a
 * candidate value. Pure, stateless, no I/O — called by SettingsService
 * before every write.
 */
@Injectable()
export class SettingsValidator {
  assertWritable(definition: SettingDefinition): void {
    if (definition.isReadOnly) {
      throw new SettingReadOnlyException(buildSettingKey(definition.category, definition.key));
    }
  }

  validate(definition: SettingDefinition, value: SettingValue): void {
    const settingKey = buildSettingKey(definition.category, definition.key);
    const rules = definition.validation;

    if (value === null || value === undefined) {
      if (rules?.required) {
        throw new SettingValidationException(settingKey, 'value is required');
      }
      if (value === null && rules?.nullable === false) {
        throw new SettingValidationException(settingKey, 'value cannot be null');
      }
      return;
    }

    this.assertType(settingKey, definition.type, value);

    if (rules?.allowedValues && !rules.allowedValues.includes(value as string | number | boolean)) {
      throw new SettingValidationException(
        settingKey,
        `must be one of [${rules.allowedValues.join(', ')}]`
      );
    }

    if (typeof value === 'number') {
      if (rules?.min !== undefined && value < rules.min) {
        throw new SettingValidationException(settingKey, `must be >= ${rules.min}`);
      }
      if (rules?.max !== undefined && value > rules.max) {
        throw new SettingValidationException(settingKey, `must be <= ${rules.max}`);
      }
    }

    if (typeof value === 'string') {
      if (rules?.min !== undefined && value.length < rules.min) {
        throw new SettingValidationException(
          settingKey,
          `must be at least ${rules.min} characters`
        );
      }
      if (rules?.max !== undefined && value.length > rules.max) {
        throw new SettingValidationException(settingKey, `must be at most ${rules.max} characters`);
      }
      if (rules?.regex && !new RegExp(rules.regex).test(value)) {
        throw new SettingValidationException(settingKey, `must match pattern ${rules.regex}`);
      }
    }
  }

  private assertType(settingKey: string, type: SettingType, value: SettingValue): void {
    switch (type) {
      case SettingType.NUMBER:
        if (typeof value !== 'number' || Number.isNaN(value)) {
          throw new SettingValidationException(settingKey, 'must be a number');
        }
        return;
      case SettingType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new SettingValidationException(settingKey, 'must be a boolean');
        }
        return;
      case SettingType.ARRAY:
        if (!Array.isArray(value)) {
          throw new SettingValidationException(settingKey, 'must be an array');
        }
        return;
      case SettingType.JSON:
        if (typeof value !== 'object' || value === null) {
          throw new SettingValidationException(settingKey, 'must be a JSON object');
        }
        return;
      case SettingType.EMAIL:
        if (
          typeof value !== 'string' ||
          (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        ) {
          throw new SettingValidationException(settingKey, 'must be a valid email address');
        }
        return;
      case SettingType.URL:
        if (typeof value !== 'string') {
          throw new SettingValidationException(settingKey, 'must be a URL string');
        }
        if (value.length > 0) {
          try {
            new URL(value);
          } catch {
            throw new SettingValidationException(settingKey, 'must be a valid URL');
          }
        }
        return;
      case SettingType.COLOR:
        if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
          throw new SettingValidationException(settingKey, 'must be a hex color (e.g. #0f172a)');
        }
        return;
      case SettingType.STRING:
      case SettingType.TEXT:
      case SettingType.PASSWORD:
      case SettingType.SECRET:
      case SettingType.FILE_REFERENCE:
        if (typeof value !== 'string') {
          throw new SettingValidationException(settingKey, 'must be a string');
        }
        return;
      default:
        return;
    }
  }
}
