import { Injectable } from '@nestjs/common';
import { Layout } from '@prisma/client';
import { LayoutResponseDto } from '../dto/layout-response.dto';

@Injectable()
export class LayoutsMapper {
  toResponseDto(layout: Layout): LayoutResponseDto {
    return {
      id: layout.id,
      name: layout.name,
      slug: layout.slug,
      status: layout.status,
      layoutPreset: layout.layoutPreset,
      themeId: layout.themeId,
      createdAt: layout.createdAt.toISOString(),
      updatedAt: layout.updatedAt.toISOString(),
      deletedAt: layout.deletedAt?.toISOString() ?? null,
    };
  }
}
