import { Injectable } from '@nestjs/common';
import { SENSITIVE_SETTING_TYPES } from '../enums/setting-type.enum';
import { SettingDefinition, buildSettingKey } from '../interfaces/setting-definition.interface';
import { SettingValue } from '../interfaces/setting-value.type';
import { SettingResponseDto, SettingValueSource } from '../dto/setting-response.dto';

@Injectable()
export class SettingsMapper {
  toResponseDto(
    definition: SettingDefinition,
    resolvedValue: SettingValue,
    source: SettingValueSource,
    options: { reveal?: boolean } = {}
  ): SettingResponseDto {
    const isSensitive =
      SENSITIVE_SETTING_TYPES.has(definition.type) || definition.isEncrypted === true;
    const value = isSensitive && !options.reveal ? null : resolvedValue;

    return {
      key: buildSettingKey(definition.category, definition.key),
      category: definition.category,
      type: definition.type,
      label: definition.label,
      description: definition.description,
      value,
      source,
      isReadOnly: Boolean(definition.isReadOnly),
      isHidden: Boolean(definition.isHidden),
      isEncrypted: Boolean(definition.isEncrypted),
    };
  }
}
