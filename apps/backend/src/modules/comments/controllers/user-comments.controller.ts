import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { CommentsService } from '../services/comments.service';
import { CommentQueryDto } from '../dto/comment-query.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * `GET /users/:id/comments` from the milestone brief's API list, kept as
 * its own controller inside the Comments module rather than editing the
 * frozen `UsersController` (`42_USER_MANAGEMENT_ARCHITECTURE.md`) — same
 * rationale as `ArticleCommentsController`.
 */
@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('users/:userId/comments')
export class UserCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: "List a user's authored comments (paginated)" })
  @ApiParam({ name: 'userId' })
  @ApiWrappedResponse(CommentResponseDto, { isArray: true })
  async listUserComments(
    @Param('userId') userId: string,
    @Query() query: CommentQueryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PaginatedResult<CommentResponseDto>> {
    return this.commentsService.listUserComments(
      userId,
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
}
