import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicSeoService } from '../services/public-seo.service';
import { PublicSeoResponseDto } from '../dto/public-seo-response.dto';
import {
  isPublicSeoEntityType,
  PUBLIC_SEO_ENTITY_TYPES,
} from '../constants/public-seo-entity-type';

/**
 * Public SEO API (Backend Milestone 13.2) — deliberately a separate
 * controller from `SeoController`, not `@Public()` routes added to it —
 * same reasoning `PublicPagesController`'s doc comment gives:
 * `SeoController` carries a class-level `@UseGuards(PermissionGuard)` +
 * `@RequirePermission(PERMISSIONS.SEO_MANAGE)`, so a route inside it can
 * never truly be public.
 */
@ApiTags('Public SEO')
@Public()
@Controller('public/seo')
export class PublicSeoController {
  constructor(private readonly publicSeoService: PublicSeoService) {}

  @Get(':entity/:slug')
  @ApiOperation({
    summary: 'Get SEO metadata for a published page/article/category by slug — public, no auth',
  })
  @ApiParam({ name: 'entity', enum: PUBLIC_SEO_ENTITY_TYPES })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(PublicSeoResponseDto)
  async getSeoForEntity(
    @Param('entity') entity: string,
    @Param('slug') slug: string
  ): Promise<PublicSeoResponseDto> {
    if (!isPublicSeoEntityType(entity)) {
      throw new BadRequestException(
        `"entity" must be one of: ${PUBLIC_SEO_ENTITY_TYPES.join(', ')}.`
      );
    }
    return this.publicSeoService.getSeoForEntity(entity, slug);
  }
}
