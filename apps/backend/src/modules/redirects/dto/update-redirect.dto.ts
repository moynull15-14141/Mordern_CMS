import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { RedirectStatus } from '@prisma/client';
import { ALLOWED_REDIRECT_TYPES } from '../constants/redirect.constants';

export class UpdateRedirectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  sourcePath?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  destinationUrl?: string;

  @ApiPropertyOptional({ enum: ALLOWED_REDIRECT_TYPES })
  @IsOptional()
  @IsIn(ALLOWED_REDIRECT_TYPES)
  redirectType?: number;

  @ApiPropertyOptional({ enum: RedirectStatus })
  @IsOptional()
  @IsEnum(RedirectStatus)
  status?: RedirectStatus;
}
