import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import {
  PASSWORD_POLICY_DESCRIPTION,
  PASSWORD_POLICY_REGEX,
} from '../../identity/policies/password.policy';

/** Self-service change — requires the current password (verified via
 * Identity's existing PasswordService.compare(), never re-implemented). */
export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword!: string;

  @ApiProperty({ description: PASSWORD_POLICY_DESCRIPTION })
  @IsString()
  @Matches(PASSWORD_POLICY_REGEX, { message: PASSWORD_POLICY_DESCRIPTION })
  newPassword!: string;
}
