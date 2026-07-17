import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({
    description: 'New value for the setting. Type is validated against the setting definition.',
  })
  value!: unknown;
}
