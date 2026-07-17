import { ApiProperty } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  ipAddress!: string | null;

  @ApiProperty({ nullable: true })
  userAgent!: string | null;

  @ApiProperty({ nullable: true })
  deviceName!: string | null;

  @ApiProperty({ nullable: true })
  browser!: string | null;

  @ApiProperty({ nullable: true })
  operatingSystem!: string | null;

  @ApiProperty({ nullable: true })
  country!: string | null;

  @ApiProperty({ nullable: true })
  city!: string | null;

  @ApiProperty()
  rememberMe!: boolean;

  @ApiProperty()
  lastSeenAt!: string;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty({ nullable: true })
  revokedAt!: string | null;
}
