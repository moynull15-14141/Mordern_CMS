import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportSettingEntryDto {
  @ApiProperty({ description: 'Fully-qualified dotted key, e.g. "general.siteName".' })
  @IsString()
  key!: string;

  @ApiProperty({ description: 'Value to import for this key.' })
  value!: unknown;
}

export class ImportSettingsDto {
  @ApiProperty({ type: [ImportSettingEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportSettingEntryDto)
  settings!: ImportSettingEntryDto[];
}

export class ImportSettingsResultDto {
  @ApiProperty()
  imported!: number;

  @ApiProperty()
  skipped!: number;

  @ApiProperty({ type: [String] })
  skippedKeys!: string[];
}
