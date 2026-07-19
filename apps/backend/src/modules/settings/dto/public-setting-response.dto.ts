import { ApiProperty } from '@nestjs/swagger';

/**
 * Public, rendering-only shape for one allowlisted setting — powers
 * `GET /public/settings` (Milestone 13.2). Deliberately excludes
 * `category`/`type`/`source`/`isReadOnly`/`isHidden`/`isEncrypted`, all of
 * which are admin/internal metadata the admin `SettingResponseDto`
 * exposes; a public renderer only ever needs the value and a display
 * label.
 */
export class PublicSettingResponseDto {
  @ApiProperty({ example: 'general.siteName' })
  key!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  value!: unknown;
}
