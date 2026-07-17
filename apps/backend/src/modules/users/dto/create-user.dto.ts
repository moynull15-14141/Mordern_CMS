import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import {
  PASSWORD_POLICY_DESCRIPTION,
  PASSWORD_POLICY_REGEX,
} from '../../identity/policies/password.policy';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  displayName?: string;

  @ApiPropertyOptional({
    description: `${PASSWORD_POLICY_DESCRIPTION} Omit to create the account without a usable password (e.g. invite-only flow).`,
  })
  @IsOptional()
  @IsString()
  @Matches(PASSWORD_POLICY_REGEX, { message: PASSWORD_POLICY_DESCRIPTION })
  password?: string;
}
