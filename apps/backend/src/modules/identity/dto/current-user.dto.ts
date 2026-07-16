import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class CurrentUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  username?: string | null;

  @ApiPropertyOptional({ nullable: true })
  displayName?: string | null;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;
}
