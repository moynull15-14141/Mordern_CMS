import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import {
  PASSWORD_POLICY_DESCRIPTION,
  PASSWORD_POLICY_REGEX,
} from '../../identity/policies/password.policy';

/** Admin-initiated reset — no current-password check (admin privilege via
 * `users.manage`), unlike ChangePasswordDto's self-service flow. */
export class AdminResetPasswordDto {
  @ApiProperty({ description: PASSWORD_POLICY_DESCRIPTION })
  @IsString()
  @Matches(PASSWORD_POLICY_REGEX, { message: PASSWORD_POLICY_DESCRIPTION })
  newPassword!: string;
}
