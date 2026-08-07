import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class BulkMediaActionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids!: string[];
}

export class BulkMoveMediaDto extends BulkMediaActionDto {
  @ApiPropertyOptional({ description: 'Omit / null to move to root.' })
  @IsOptional()
  @IsUUID()
  folderId?: string;
}

export class BulkActionFailureDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  reason!: string;
}

export class BulkActionResultDto {
  @ApiProperty({ type: [String] })
  succeeded!: string[];

  @ApiProperty({ type: [BulkActionFailureDto] })
  failed!: BulkActionFailureDto[];
}

export class PermanentDeleteMediaDto {
  @ApiProperty({ description: 'Must be true — a deliberate extra safety rail beyond soft-delete.' })
  @IsBoolean()
  confirm!: boolean;
}
