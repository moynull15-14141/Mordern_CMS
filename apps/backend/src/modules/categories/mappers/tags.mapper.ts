import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { TagResponseDto } from '../dto/tag-response.dto';

@Injectable()
export class TagsMapper {
  toResponseDto(tag: Tag, usageCount: number): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      synonyms: (tag.synonyms as string[] | null) ?? null,
      usageCount,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
      deletedAt: tag.deletedAt?.toISOString() ?? null,
    };
  }
}
