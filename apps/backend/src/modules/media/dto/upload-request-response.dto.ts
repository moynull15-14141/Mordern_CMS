import { ApiProperty } from '@nestjs/swagger';

export class UploadRequestResponseDto {
  @ApiProperty()
  mediaAssetId!: string;

  @ApiProperty({
    description: 'Short-lived signed PUT URL — the browser uploads directly to this.',
  })
  uploadUrl!: string;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty()
  storageKey!: string;
}

export class MultipartPartUrlDto {
  @ApiProperty()
  partNumber!: number;

  @ApiProperty()
  url!: string;
}

export class MultipartUploadRequestResponseDto {
  @ApiProperty()
  mediaAssetId!: string;

  @ApiProperty()
  uploadId!: string;

  @ApiProperty()
  storageKey!: string;

  @ApiProperty({ type: [MultipartPartUrlDto] })
  parts!: MultipartPartUrlDto[];
}
