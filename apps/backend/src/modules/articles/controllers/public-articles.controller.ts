import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { PublicArticlesService } from '../services/public-articles.service';
import { PublicArticleQueryDto } from '../dto/public-article-query.dto';
import {
  PublicArticleListItemDto,
  PublicArticleResponseDto,
} from '../dto/public-article-response.dto';

/**
 * Public Articles API (Backend Milestone 13.2). Deliberately a separate
 * controller from `ArticlesController`, not `@Public()` routes added to
 * it — same reasoning `PublicPagesController`'s doc comment gives:
 * `ArticlesController` carries a class-level
 * `@UseGuards(PermissionGuard)`, so a route inside it can never truly be
 * public. `slug/:slug` is registered before no catch-all `:id` route
 * exists on this controller (unlike the admin one), so there is no
 * route-ordering hazard to guard against here.
 */
@ApiTags('Public Articles')
@Public()
@Controller('public/articles')
export class PublicArticlesController {
  constructor(private readonly publicArticlesService: PublicArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'List published, public articles (paginated) — public, no auth' })
  @ApiWrappedResponse(PublicArticleListItemDto, { isArray: true })
  async listArticles(
    @Query() query: PublicArticleQueryDto
  ): Promise<PaginatedResult<PublicArticleListItemDto>> {
    return this.publicArticlesService.listArticles(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a published, public/unlisted article by slug — public, no auth' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(PublicArticleResponseDto)
  async getArticleBySlug(@Param('slug') slug: string): Promise<PublicArticleResponseDto> {
    return this.publicArticlesService.getArticleBySlug(slug);
  }
}
