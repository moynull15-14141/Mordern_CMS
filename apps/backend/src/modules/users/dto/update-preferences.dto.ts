import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ThemePreference } from '../constants/user.constants';

export class NotificationPreferenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inApp?: boolean;
}

/** Partial by design — PATCH semantics; only provided fields are merged
 * into the existing `User.metadata.preferences` JSON blob. */
export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: ThemePreference })
  @IsOptional()
  @IsEnum(ThemePreference)
  theme?: ThemePreference;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  editorPreference?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  dashboardPreference?: Record<string, unknown>;

  @ApiPropertyOptional({ type: NotificationPreferenceDto })
  @IsOptional()
  @IsObject()
  notificationPreference?: NotificationPreferenceDto;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  accessibilityPreference?: Record<string, unknown>;
}
