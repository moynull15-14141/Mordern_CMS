import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

/** Updates the logical display name (metadata.filename) only —
 * `storageKey` (the real storage locator) is never changed. */
export class RenameMediaAssetDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  filename!: string;
}
