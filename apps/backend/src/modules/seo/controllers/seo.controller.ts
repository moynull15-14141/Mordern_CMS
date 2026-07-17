import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequirePermission } from '../../authorization/decorators/require-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { SeoService } from '../services/seo.service';
import { CreateSeoDto } from '../dto/create-seo.dto';
import { UpdateSeoDto } from '../dto/update-seo.dto';
import { UpsertSeoDto } from '../dto/upsert-seo.dto';
import { SeoResponseDto } from '../dto/seo-response.dto';
import { SeoPreviewDto, SeoPreviewRequestDto } from '../dto/seo-preview.dto';
import { SeoValidateRequestDto, SeoValidationDto } from '../dto/seo-validation.dto';

/**
 * SEO & Metadata Engine Foundation (Milestone 12). Every endpoint reuses
 * the existing `seo.manage` permission (`38_RBAC_ARCHITECTURE.md`) — no
 * `seo.view`/read-only split exists (frozen vocabulary), so reads are
 * gated the same as writes, matching the Settings/Categories precedent of
 * "one coarse permission for the whole resource" — see
 * docs/51_SEO_ARCHITECTURE.md "Permission Flow".
 */
@ApiTags('SEO')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.SEO_MANAGE)
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new SeoMeta row' })
  @ApiWrappedResponse(SeoResponseDto)
  async createSeo(
    @Body() dto: CreateSeoDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SeoResponseDto> {
    return this.seoService.createSeo(dto, { id: user.id });
  }

  @Post('upsert')
  @ApiOperation({
    summary: 'Upsert SEO metadata by id (create if omitted or not found, else update)',
  })
  @ApiWrappedResponse(SeoResponseDto)
  async upsertSeo(
    @Body() dto: UpsertSeoDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SeoResponseDto> {
    return this.seoService.upsertSeo(dto, { id: user.id });
  }

  @Post('preview')
  @ApiOperation({
    summary:
      'Generate a search/social preview object for a candidate set of SEO fields — no persistence',
  })
  @ApiWrappedResponse(SeoPreviewDto)
  async previewSeo(@Body() dto: SeoPreviewRequestDto): Promise<SeoPreviewDto> {
    return this.seoService.previewSeo(dto);
  }

  @Post('validate')
  @ApiOperation({
    summary:
      'Validate a candidate set of SEO fields — returns hard errors and soft analysis warnings, no persistence',
  })
  @ApiWrappedResponse(SeoValidationDto)
  async validateSeo(@Body() dto: SeoValidateRequestDto): Promise<SeoValidationDto> {
    return this.seoService.validateSeoInput(dto);
  }

  @Get('article/:articleId')
  @ApiOperation({ summary: "Get an article's linked SEO metadata" })
  @ApiParam({ name: 'articleId' })
  @ApiWrappedResponse(SeoResponseDto)
  async getSeoForArticle(@Param('articleId') articleId: string): Promise<SeoResponseDto> {
    return this.seoService.getSeoForArticle(articleId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: "Get a category's linked SEO metadata" })
  @ApiParam({ name: 'categoryId' })
  @ApiWrappedResponse(SeoResponseDto)
  async getSeoForCategory(@Param('categoryId') categoryId: string): Promise<SeoResponseDto> {
    return this.seoService.getSeoForCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single SeoMeta row by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(SeoResponseDto)
  async getSeo(@Param('id') id: string): Promise<SeoResponseDto> {
    return this.seoService.getSeo(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing SeoMeta row' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(SeoResponseDto)
  async updateSeo(
    @Param('id') id: string,
    @Body() dto: UpdateSeoDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SeoResponseDto> {
    return this.seoService.updateSeo(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a SeoMeta row' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(SeoResponseDto)
  async deleteSeo(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SeoResponseDto> {
    return this.seoService.deleteSeo(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted SeoMeta row' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(SeoResponseDto)
  async restoreSeo(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SeoResponseDto> {
    return this.seoService.restoreSeo(id, { id: user.id });
  }
}
