import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_POLICY_DESCRIPTION, PASSWORD_POLICY_REGEX } from '../policies/password.policy';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ description: PASSWORD_POLICY_DESCRIPTION })
  @IsString()
  @Matches(PASSWORD_POLICY_REGEX, { message: PASSWORD_POLICY_DESCRIPTION })
  newPassword!: string;
}
