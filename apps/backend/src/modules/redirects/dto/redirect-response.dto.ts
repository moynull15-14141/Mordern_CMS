import { ApiProperty } from '@nestjs/swagger';
import { RedirectStatus } from '@prisma/client';

export class RedirectResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sourcePath!: string;

  @ApiProperty()
  destinationUrl!: string;

  @ApiProperty()
  redirectType!: number;

  @ApiProperty({ enum: RedirectStatus })
  status!: RedirectStatus;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}

/** `GET /public/redirects/lookup` — deliberately excludes `id`/`status`/
 * audit fields, mirroring every other Public DTO's "rendering-only" rule. */
export class PublicRedirectResponseDto {
  @ApiProperty()
  destinationUrl!: string;

  @ApiProperty()
  redirectType!: number;
}
