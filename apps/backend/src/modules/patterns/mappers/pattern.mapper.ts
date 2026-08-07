import { Injectable } from '@nestjs/common';
import { Pattern } from '@prisma/client';
import { PatternResponseDto, PatternSummaryDto } from '../dto/pattern-response.dto';
import { PublicPatternResponseDto } from '../dto/public-pattern-response.dto';

function extractBlocks(body: unknown): unknown[] {
  return typeof body === 'object' &&
    body !== null &&
    Array.isArray((body as { blocks?: unknown }).blocks)
    ? (body as { blocks: unknown[] }).blocks
    : [];
}

@Injectable()
export class PatternMapper {
  toResponseDto(pattern: Pattern): PatternResponseDto {
    return {
      id: pattern.id,
      name: pattern.name,
      slug: pattern.slug,
      description: pattern.description,
      category: pattern.category,
      tags: pattern.tags,
      status: pattern.status,
      thumbnailMediaId: pattern.thumbnailMediaId,
      body: pattern.body,
      version: pattern.version,
      createdBy: pattern.createdBy,
      updatedBy: pattern.updatedBy,
      createdAt: pattern.createdAt.toISOString(),
      updatedAt: pattern.updatedAt.toISOString(),
      deletedAt: pattern.deletedAt?.toISOString() ?? null,
    };
  }

  toSummaryDto(pattern: Pattern): PatternSummaryDto {
    return {
      id: pattern.id,
      name: pattern.name,
      slug: pattern.slug,
      description: pattern.description,
      category: pattern.category,
      tags: pattern.tags,
      status: pattern.status,
      thumbnailMediaId: pattern.thumbnailMediaId,
      blockCount: extractBlocks(pattern.body).length,
      version: pattern.version,
      updatedAt: pattern.updatedAt.toISOString(),
      deletedAt: pattern.deletedAt?.toISOString() ?? null,
    };
  }

  toPublicResponseDto(pattern: Pattern): PublicPatternResponseDto {
    return { id: pattern.id, name: pattern.name, body: pattern.body };
  }
}
