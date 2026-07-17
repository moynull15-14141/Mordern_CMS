import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

/** Omit (or send null) to move the asset to the root (no folder). */
export class MoveMediaAssetDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  folderId?: string | null;
}
