import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SettingEntryDto {
  @ApiProperty({
    description: 'Setting key, unqualified by category (category comes from the route/entry).',
  })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'New value for the setting.' })
  // See `UpdateSettingDto.value` — same reasoning: `@IsOptional()` only to
  // survive the global whitelist filter, no type constraint (polymorphic
  // value, validated downstream by `SettingsValidator.assertType()`).
  @IsOptional()
  value!: unknown;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({ type: [SettingEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingEntryDto)
  settings!: SettingEntryDto[];
}
