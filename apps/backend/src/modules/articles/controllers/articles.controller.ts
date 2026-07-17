import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequirePermission } from '../../authorization/decorators/require-permission.decorator';
import { RequireAnyPermission } from '../../authorization/decorators/require-any-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { ArticlesService } from '../services/articles.service';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ScheduleArticleDto } from '../dto/schedule-article.dto';
import { ArticleQueryDto } from '../dto/article-query.dto';
import { ArticleResponseDto } from '../dto/article-response.dto';
import {
  ArticleRevisionCompareDto,
  ArticleRevisionResponseDto,
} from '../dto/article-revision-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

const ANY_ARTICLE_PERMISSION = [
  PERMISSIONS.ARTICLE_CREATE,
  PERMISSIONS.ARTICLE_UPDATE,
  PERMISSIONS.ARTICLE_DELETE,
  PERMISSIONS.ARTICLE_PUBLISH,
];

/**
 * Articles Foundation (Milestone 8). No `article.view` permission exists
 * (frozen 21-key vocabulary, `38_RBAC_ARCHITECTURE.md`) — read endpoints use
 * the existing `RequireAnyPermission` OR-mechanism across all 4 article
 * permissions rather than inventing one. Write endpoints additionally
 * enforce ownership via `ArticleOwnershipPolicy` inside the service (Owner/
 * Editor/Administrator/Super Admin — see docs/46_ARTICLES_ARCHITECTURE.md
 * "Permission Flow"). `article.publish`-gated endpoints (`/publish`,
 * `/schedule`) are editorial-tier, not ownership-tier — no policy check.
 */
@ApiTags('Articles')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @RequireAnyPermission(...ANY_ARTICLE_PERMISSION)
  @ApiOperation({ summary: 'List/search/filter/sort articles (paginated)' })
  @ApiWrappedResponse(ArticleResponseDto, { isArray: true })
  async listArticles(
    @Query() query: ArticleQueryDto
  ): Promise<PaginatedResult<ArticleResponseDto>> {
    return this.articlesService.listArticles({
      filters: {
        status: query.status,
        visibility: query.visibility,
        authorId: query.authorId,
        categoryId: query.categoryId,
        tagId: query.tagId,
        search: query.search,
        publishedFrom: query.publishedFrom ? new Date(query.publishedFrom) : undefined,
        publishedTo: query.publishedTo ? new Date(query.publishedTo) : undefined,
      },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get('slug/:slug')
  @RequireAnyPermission(...ANY_ARTICLE_PERMISSION)
  @ApiOperation({ summary: 'Get an article by slug' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(ArticleResponseDto)
  async getArticleBySlug(@Param('slug') slug: string): Promise<ArticleResponseDto> {
    return this.articlesService.getArticleBySlug(slug);
  }

  @Get(':id')
  @RequireAnyPermission(...ANY_ARTICLE_PERMISSION)
  @ApiOperation({ summary: 'Get an article by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ArticleResponseDto)
  async getArticle(@Param('id') id: string): Promise<ArticleResponseDto> {
    return this.articlesService.getArticle(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.ARTICLE_CREATE)
  @ApiOperation({ summary: 'Create an article' })
  @ApiWrappedResponse(ArticleResponseDto)
  async createArticle(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ArticleResponseDto> {
    return this.articlesService.createArticle(dto, { id: user.id });
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.ARTICLE_UPDATE)
  @ApiOperation({
    summary:
      'Update an article (Owner/Editor/Administrator/Super Admin only; status limited to DRAFT/REVIEW/ARCHIVED)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ArticleResponseDto)
  async updateArticle(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ArticleResponseDto> {
    return this.articlesService.updateArticle(id, dto, { id: user.id });
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.ARTICLE_DELETE)
  @ApiOperation({ summary: 'Soft-delete an article (Owner/Editor/Administrator/Super Admin only)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ArticleResponseDto)
  async deleteArticle(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ArticleResponseDto> {
    return this.articlesService.deleteArticle(id, { id: user.id });
  }

  @Post(':id/restore')
  @RequirePermission(PERMISSIONS.ARTICLE_DELETE)
  @ApiOperation({
    summary:
      'Restore a soft-deleted article (reuses article.delete — no article.restore permission exists)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ArticleResponseDto)
  async restoreArticle(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ArticleResponseDto> {
    return this.articlesService.restoreArticle(id, { id: user.id });
  }

  @Post(':id/publish')
  @RequirePermission(PERMISSIONS.ARTICLE_PUBLISH)
  @ApiOperation({ summary: 'Publish an article immediately' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ArticleResponseDto)
  async publishArticle(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ArticleResponseDto> {
    return this.articlesService.publishArticle(id, { id: user.id });
  }

  @Post(':id/schedule')
  @RequirePermission(PERMISSIONS.ARTICLE_PUBLISH)
  @ApiOperation({ summary: 'Schedule an article for future publication' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ArticleResponseDto)
  async scheduleArticle(
    @Param('id') id: string,
    @Body() dto: ScheduleArticleDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ArticleResponseDto> {
    return this.articlesService.scheduleArticle(id, dto, { id: user.id });
  }

  @Get(':id/revisions')
  @RequireAnyPermission(...ANY_ARTICLE_PERMISSION)
  @ApiOperation({ summary: 'List every revision of an article' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ArticleRevisionResponseDto, { isArray: true })
  async listRevisions(@Param('id') id: string): Promise<ArticleRevisionResponseDto[]> {
    return this.articlesService.listRevisions(id);
  }

  @Get(':id/revisions/compare')
  @RequireAnyPermission(...ANY_ARTICLE_PERMISSION)
  @ApiOperation({ summary: "Compare two revisions' metadata (no visual diff)" })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'from', type: Number })
  @ApiQuery({ name: 'to', type: Number })
  @ApiWrappedResponse(ArticleRevisionCompareDto)
  async compareRevisions(
    @Param('id') id: string,
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number
  ): Promise<ArticleRevisionCompareDto> {
    return this.articlesService.compareRevisions(id, from, to);
  }

  @Post(':id/revisions/:version/restore')
  @RequirePermission(PERMISSIONS.ARTICLE_UPDATE)
  @ApiOperation({
    summary: 'Restore a past revision as a new update (history is never mutated or deleted)',
  })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'version' })
  @ApiWrappedResponse(ArticleResponseDto)
  async restoreRevision(
    @Param('id') id: string,
    @Param('version', ParseIntPipe) version: number,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ArticleResponseDto> {
    return this.articlesService.restoreRevision(id, version, { id: user.id });
  }
}
