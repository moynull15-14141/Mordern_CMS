import { Injectable } from '@nestjs/common';
import { ReusableBlock } from '@prisma/client';
import { ReusableBlockResponseDto } from '../dto/reusable-block-response.dto';

@Injectable()
export class ReusableBlockMapper {
  toResponseDto(block: ReusableBlock): ReusableBlockResponseDto {
    return {
      id: block.id,
      name: block.name,
      blockType: block.blockType,
      data: block.data,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
      deletedAt: block.deletedAt?.toISOString() ?? null,
    };
  }
}
