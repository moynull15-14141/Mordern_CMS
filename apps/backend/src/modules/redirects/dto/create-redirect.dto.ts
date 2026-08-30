import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ALLOWED_REDIRECT_TYPES, DEFAULT_REDIRECT_TYPE } from '../constants/redirect.constants';

export class CreateRedirectDto {
  @ApiProperty({ description: 'The old path visitors currently land on, e.g. /old-about.' })
  @IsString()
  @MaxLength(2000)
  sourcePath!: string;

  @ApiProperty({
    description: 'Where to send them — an internal path (/about) or a full https:// URL.',
  })
  @IsString()
  @MaxLength(2000)
  destinationUrl!: string;

  @ApiPropertyOptional({ enum: ALLOWED_REDIRECT_TYPES, default: DEFAULT_REDIRECT_TYPE })
  @IsOptional()
  @IsIn(ALLOWED_REDIRECT_TYPES)
  redirectType?: number = DEFAULT_REDIRECT_TYPE;
}
