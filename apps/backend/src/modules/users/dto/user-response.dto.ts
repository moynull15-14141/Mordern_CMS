import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { UserProfile } from '../interfaces/user-profile.interface';
import { UserPreferences } from '../interfaces/user-preferences.interface';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  username!: string | null;

  @ApiProperty({ nullable: true })
  displayName!: string | null;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ nullable: true })
  profileImageId!: string | null;

  @ApiProperty({ nullable: true })
  lastLoginAt!: string | null;

  @ApiProperty({
    description:
      'True if the account is locked (tracked outside the frozen UserStatus enum — see docs/42_USER_MANAGEMENT_ARCHITECTURE.md).',
  })
  locked!: boolean;

  @ApiProperty({ type: Object, nullable: true })
  profile!: UserProfile | null;

  @ApiProperty({ type: Object, nullable: true })
  preferences!: UserPreferences | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
