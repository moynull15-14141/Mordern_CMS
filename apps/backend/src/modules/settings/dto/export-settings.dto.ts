import { ApiProperty } from '@nestjs/swagger';
import { SettingResponseDto } from './setting-response.dto';

export class ExportSettingsDto {
  @ApiProperty()
  exportedAt!: string;

  @ApiProperty({ type: [SettingResponseDto] })
  settings!: SettingResponseDto[];
}
