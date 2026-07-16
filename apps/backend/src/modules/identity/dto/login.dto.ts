import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd', description: 'The account password as originally set — not re-validated against the current password policy.' })
  @IsString()
  @MinLength(1)
  password!: string;

  @ApiPropertyOptional({ default: false, description: 'Issues a longer-lived refresh token/session when true.' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @ApiPropertyOptional({ example: 'Chrome on macOS' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
