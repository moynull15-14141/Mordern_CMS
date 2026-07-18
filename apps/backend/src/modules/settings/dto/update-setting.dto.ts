import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({
    description: 'New value for the setting. Type is validated against the setting definition.',
  })
  // `@IsOptional()` is the loosest decorator that still registers this
  // property with class-validator — without at least one decorator, the
  // global `AppValidationPipe`'s `whitelist: true` strips it as an
  // "unknown property" before it ever reaches the controller. No stricter
  // decorator is used deliberately: `value` is genuinely polymorphic
  // (string/number/boolean/object/array/null) and its real shape is
  // checked downstream by `SettingsValidator.assertType()`, not here.
  @IsOptional()
  value!: unknown;
}
