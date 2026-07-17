import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/** Copies altText/caption/credit/filename from the source asset (:id) onto
 * this target asset — never touches storageKey/mimeType/filesize/type. */
export class CopyMediaMetadataDto {
  @ApiProperty({ description: 'Target MediaAsset id to copy metadata onto.' })
  @IsUUID()
  targetId!: string;
}
