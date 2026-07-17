import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequirePermission } from '../../authorization/decorators/require-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { SettingCategory } from '../enums/setting-category.enum';
import { SettingResponseDto } from '../dto/setting-response.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { BulkUpdateSettingsDto } from '../dto/bulk-update-settings.dto';
import { ImportSettingsDto, ImportSettingsResultDto } from '../dto/import-settings.dto';
import { ExportSettingsDto } from '../dto/export-settings.dto';
import { ResetCategoryDto, ResetResultDto } from '../dto/reset-settings.dto';
import { SettingsService } from '../services/settings.service';

/**
 * Platform Settings foundation (Milestone 6). Global scope only in this
 * milestone's endpoints (no site/tenant routing param exposed yet — see
 * docs/39_SETTINGS_ARCHITECTURE.md "Setting Scope"). Every endpoint requires
 * the single frozen `settings.manage` permission (`38_RBAC_ARCHITECTURE.md`)
 * — Settings, including SECRET/PASSWORD-typed entries, are admin-level
 * information; there is no separate view-only permission to invent.
 */
@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.SETTINGS_MANAGE)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get every setting, resolved through the priority chain' })
  @ApiWrappedResponse(SettingResponseDto, { isArray: true })
  async getAll(): Promise<SettingResponseDto[]> {
    return this.settingsService.getAll();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export all resolved settings (sensitive values redacted)' })
  @ApiWrappedResponse(ExportSettingsDto)
  async exportSettings(): Promise<ExportSettingsDto> {
    return this.settingsService.exportSettings();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get every setting in a category' })
  @ApiParam({ name: 'category', enum: SettingCategory })
  @ApiWrappedResponse(SettingResponseDto, { isArray: true })
  async getByCategory(@Param('category') category: SettingCategory): Promise<SettingResponseDto[]> {
    return this.settingsService.getByCategory(category);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a single setting by its dotted "category.key" identity' })
  @ApiParam({ name: 'key', example: 'general.siteName' })
  @ApiWrappedResponse(SettingResponseDto)
  async getByKey(@Param('key') key: string): Promise<SettingResponseDto> {
    return this.settingsService.getByKey(key);
  }

  @Put('category/:category')
  @ApiOperation({ summary: 'Bulk-update every setting in a category' })
  @ApiParam({ name: 'category', enum: SettingCategory })
  @ApiWrappedResponse(SettingResponseDto, { isArray: true })
  async bulkUpdateCategory(
    @Param('category') category: SettingCategory,
    @Body() dto: BulkUpdateSettingsDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SettingResponseDto[]> {
    return this.settingsService.bulkUpdateCategory(category, dto.settings, undefined, user.id);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update a single setting by its dotted "category.key" identity' })
  @ApiParam({ name: 'key', example: 'general.siteName' })
  @ApiWrappedResponse(SettingResponseDto)
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SettingResponseDto> {
    return this.settingsService.updateSetting(key, dto.value as never, undefined, user.id);
  }

  @Post('import')
  @ApiOperation({
    summary: 'Bulk-import settings; unknown or read-only keys are skipped, not errored',
  })
  @ApiWrappedResponse(ImportSettingsResultDto)
  async importSettings(
    @Body() dto: ImportSettingsDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ImportSettingsResultDto> {
    return this.settingsService.importSettings(dto.settings, undefined, user.id);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset every setting to its system default' })
  @ApiWrappedResponse(ResetResultDto)
  async resetAll(@CurrentUser() user: AuthenticatedUser): Promise<ResetResultDto> {
    const resetCount = await this.settingsService.resetAll(undefined, user.id);
    return { resetCount };
  }

  @Post('reset/category')
  @ApiOperation({ summary: 'Reset every setting in one category to its system default' })
  @ApiWrappedResponse(ResetResultDto)
  async resetCategory(
    @Body() dto: ResetCategoryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ResetResultDto> {
    const resetCount = await this.settingsService.resetCategory(dto.category, undefined, user.id);
    return { resetCount };
  }
}
