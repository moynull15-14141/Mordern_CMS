import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/** Metadata only — sets `User.profileImageId` to reference an existing
 * `MediaAsset` row. No file upload, no storage provider (out of scope for
 * this milestone; see docs/42_USER_MANAGEMENT_ARCHITECTURE.md "Avatar Flow"). */
export class UpdateAvatarDto {
  @ApiProperty({ description: 'Existing MediaAsset id to use as the avatar.' })
  @IsUUID()
  mediaAssetId!: string;
}
