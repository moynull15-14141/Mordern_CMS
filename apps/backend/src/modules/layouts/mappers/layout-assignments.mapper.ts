import { Injectable } from '@nestjs/common';
import { LayoutAssignment } from '@prisma/client';
import { LayoutAssignmentResponseDto } from '../dto/layout-assignment-response.dto';

@Injectable()
export class LayoutAssignmentsMapper {
  toResponseDto(assignment: LayoutAssignment): LayoutAssignmentResponseDto {
    return {
      id: assignment.id,
      layoutId: assignment.layoutId,
      contentType: assignment.contentType,
      pageId: assignment.pageId,
      articleId: assignment.articleId,
      categoryId: assignment.categoryId,
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
      deletedAt: assignment.deletedAt?.toISOString() ?? null,
    };
  }
}
