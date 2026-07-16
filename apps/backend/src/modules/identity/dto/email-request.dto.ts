import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/** Base for the two email-only requests (forgot-password, resend-verification). */
export class EmailRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;
}
