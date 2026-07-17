import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { CommentsService } from '../services/comments.service';
import { CommentQueryDto } from '../dto/comment-query.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { CommentTreeDto } from '../dto/comment-tree.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * `GET /articles/:id/comments` from the milestone brief's API list, kept as
 * its own controller inside the Comments module rather than editing the
 * frozen `ArticlesController` (`46_ARTICLES_ARCHITECTURE.md`) — mirroring
 * how Media added `MediaFolderController` alongside `MediaController`
 * within one module rather than reaching into another module's controller.
 */
@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('articles/:articleId/comments')
export class ArticleCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: "List an article's comments (flat, paginated)" })
  @ApiParam({ name: 'articleId' })
  @ApiWrappedResponse(CommentResponseDto, { isArray: true })
  async listArticleComments(
    @Param('articleId') articleId: string,
    @Query() query: CommentQueryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PaginatedResult<CommentResponseDto>> {
    return this.commentsService.listArticleComments(
      articleId,
      {
        filters: { search: query.search, status: query.status, parentId: query.parentId },
        sortBy: query.sortBy!,
        sortOrder: query.sortOrder!,
        page: query.page!,
        limit: query.limit!,
      },
      { id: user.id }
    );
  }

  @Get('tree')
  @ApiOperation({
    summary: "Full nested reply tree for an article's comments (unlimited depth, not paginated)",
  })
  @ApiParam({ name: 'articleId' })
  @ApiWrappedResponse(CommentTreeDto, { isArray: true })
  async getArticleCommentTree(@Param('articleId') articleId: string): Promise<CommentTreeDto[]> {
    return this.commentsService.getArticleCommentTree(articleId);
  }
}
