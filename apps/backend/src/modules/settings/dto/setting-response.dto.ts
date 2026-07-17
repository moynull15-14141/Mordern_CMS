import { ApiProperty } from '@nestjs/swagger';
import { SettingCategory } from '../enums/setting-category.enum';
import { SettingType } from '../enums/setting-type.enum';

/** Where a setting's currently-resolved value came from — the frozen
 * priority chain: Runtime Override -> Environment Variable -> Database
 * Setting -> System Default (see docs/39_SETTINGS_ARCHITECTURE.md). */
export enum SettingValueSource {
  RUNTIME_OVERRIDE = 'RUNTIME_OVERRIDE',
  ENVIRONMENT = 'ENVIRONMENT',
  DATABASE = 'DATABASE',
  DEFAULT = 'DEFAULT',
}

export class SettingResponseDto {
  @ApiProperty({ example: 'general.siteName' })
  key!: string;

  @ApiProperty({ enum: SettingCategory })
  category!: SettingCategory;

  @ApiProperty({ enum: SettingType })
  type!: SettingType;

  @ApiProperty()
  label!: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({
    description: 'Redacted (null) for PASSWORD/SECRET types unless explicitly revealed.',
  })
  value!: unknown;

  @ApiProperty({ enum: SettingValueSource })
  source!: SettingValueSource;

  @ApiProperty()
  isReadOnly!: boolean;

  @ApiProperty()
  isHidden!: boolean;

  @ApiProperty()
  isEncrypted!: boolean;
}
