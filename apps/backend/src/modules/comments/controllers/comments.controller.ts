import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequirePermission } from '../../authorization/decorators/require-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ApproveCommentDto } from '../dto/approve-comment.dto';
import { RejectCommentDto } from '../dto/reject-comment.dto';
import { SpamCommentDto } from '../dto/spam-comment.dto';
import { CommentQueryDto } from '../dto/comment-query.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * Comments & Discussion Foundation (Milestone 11). No `comment.create`/
 * `comment.update`/`comment.delete` permission exists (frozen vocabulary
 * has only `comment.moderate`) — creating/reading/editing/deleting one's
 * OWN comment requires only the existing global `JwtAuthGuard` (no extra
 * permission), mirroring the Users module's self-service precedent
 * (`42_USER_MANAGEMENT_ARCHITECTURE.md` "acting on one's own record isn't
 * managing users"). Ownership is enforced inside `CommentsService` via
 * `CommentOwnershipPolicy`. Only Approve/Reject/Spam are gated by the real
 * `comment.moderate` permission. See
 * docs/49_COMMENTS_ARCHITECTURE.md "Permission Flow".
 */
@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({
    summary:
      'List/search/filter/sort comments (paginated). Non-moderators only ever see APPROVED comments.',
  })
  @ApiWrappedResponse(CommentResponseDto, { isArray: true })
  async listComments(
    @Query() query: CommentQueryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PaginatedResult<CommentResponseDto>> {
    return this.commentsService.listComments(
      {
        filters: {
          articleId: query.articleId,
          userId: query.userId,
          parentId: query.parentId,
          status: query.status,
          search: query.search,
        },
        sortBy: query.sortBy!,
        sortOrder: query.sortOrder!,
        page: query.page!,
        limit: query.limit!,
      },
      { id: user.id }
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single comment by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CommentResponseDto)
  async getComment(@Param('id') id: string): Promise<CommentResponseDto> {
    return this.commentsService.getComment(id);
  }

  @Get(':id/replies')
  @ApiOperation({
    summary:
      'List direct replies of a comment (paginated, one level — use the article tree endpoint for full nesting)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CommentResponseDto, { isArray: true })
  async listReplies(
    @Param('id') id: string,
    @Query() query: CommentQueryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PaginatedResult<CommentResponseDto>> {
    return this.commentsService.listReplies(
      id,
      {
        filters: { search: query.search, status: query.status },
        sortBy: query.sortBy!,
        sortOrder: query.sortOrder!,
        page: query.page!,
        limit: query.limit!,
      },
      { id: user.id }
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create a comment (or reply, if parentId is given) — always authored by the caller',
  })
  @ApiWrappedResponse(CommentResponseDto)
  async createComment(
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CommentResponseDto> {
    return this.commentsService.createComment(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Update a comment body — ownership-gated (own comment, or Moderator/Administrator/Super Admin)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CommentResponseDto)
  async updateComment(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CommentResponseDto> {
    return this.commentsService.updateComment(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a comment — ownership-gated' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CommentResponseDto)
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CommentResponseDto> {
    return this.commentsService.deleteComment(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted comment — ownership-gated' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CommentResponseDto)
  async restoreComment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CommentResponseDto> {
    return this.commentsService.restoreComment(id, { id: user.id });
  }

  @Post(':id/approve')
  @RequirePermission(PERMISSIONS.COMMENT_MODERATE)
  @ApiOperation({ summary: 'Approve a pending comment' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CommentResponseDto)
  async approveComment(
    @Param('id') id: string,
    @Body() dto: ApproveCommentDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CommentResponseDto> {
    return this.commentsService.approveComment(id, dto, { id: user.id });
  }

  @Post(':id/reject')
  @RequirePermission(PERMISSIONS.COMMENT_MODERATE)
  @ApiOperation({ summary: 'Reject a comment (reason required)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CommentResponseDto)
  async rejectComment(
    @Param('id') id: string,
    @Body() dto: RejectCommentDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CommentResponseDto> {
    return this.commentsService.rejectComment(id, dto, { id: user.id });
  }

  @Post(':id/spam')
  @RequirePermission(PERMISSIONS.COMMENT_MODERATE)
  @ApiOperation({ summary: 'Mark a comment as spam' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CommentResponseDto)
  async markSpam(
    @Param('id') id: string,
    @Body() dto: SpamCommentDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CommentResponseDto> {
    return this.commentsService.markSpam(id, dto, { id: user.id });
  }
}
