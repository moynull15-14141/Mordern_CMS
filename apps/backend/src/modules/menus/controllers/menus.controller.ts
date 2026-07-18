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
import { MenusService } from '../services/menus.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { MenuQueryDto } from '../dto/menu-query.dto';
import { MenuResponseDto } from '../dto/menu-response.dto';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { ReorderMenuItemsDto } from '../dto/reorder-menu-items.dto';
import { MenuItemResponseDto } from '../dto/menu-item-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * Menus Foundation (Backend Milestone 11.2). Every endpoint requires the
 * single frozen `menu.manage` permission (class-level guard) — no
 * ownership split like Articles (no `authorId` on `Menu`/`MenuItem`),
 * matching Pages'/Settings' single-permission style. See
 * docs/71_BACKEND_MENUS.md.
 */
@ApiTags('Menus')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.MENU_MANAGE)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'List/search/filter/sort menus (paginated)' })
  @ApiWrappedResponse(MenuResponseDto, { isArray: true })
  async listMenus(@Query() query: MenuQueryDto): Promise<PaginatedResult<MenuResponseDto>> {
    return this.menusService.listMenus({
      filters: { status: query.status, location: query.location, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a menu (with its nested item tree) by slug' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(MenuResponseDto)
  async getMenuBySlug(@Param('slug') slug: string): Promise<MenuResponseDto> {
    return this.menusService.getMenuBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu (with its nested item tree) by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MenuResponseDto)
  async getMenu(@Param('id') id: string): Promise<MenuResponseDto> {
    return this.menusService.getMenu(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a menu (no items — add via POST /menus/:id/items)' })
  @ApiWrappedResponse(MenuResponseDto)
  async createMenu(
    @Body() dto: CreateMenuDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MenuResponseDto> {
    return this.menusService.createMenu(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a menu (name/slug/location/status)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MenuResponseDto)
  async updateMenu(
    @Param('id') id: string,
    @Body() dto: UpdateMenuDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MenuResponseDto> {
    return this.menusService.updateMenu(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a menu' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MenuResponseDto)
  async deleteMenu(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MenuResponseDto> {
    return this.menusService.deleteMenu(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted menu' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MenuResponseDto)
  async restoreMenu(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MenuResponseDto> {
    return this.menusService.restoreMenu(id, { id: user.id });
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add a menu item (optionally nested under parentId)' })
  @ApiParam({ name: 'id', description: 'Menu id' })
  @ApiWrappedResponse(MenuItemResponseDto)
  async createMenuItem(
    @Param('id') id: string,
    @Body() dto: CreateMenuItemDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MenuItemResponseDto> {
    return this.menusService.createMenuItem(id, dto, { id: user.id });
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: "Update a menu item's fields (including a single-item reparent)" })
  @ApiParam({ name: 'id', description: 'Menu id' })
  @ApiParam({ name: 'itemId' })
  @ApiWrappedResponse(MenuItemResponseDto)
  async updateMenuItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MenuItemResponseDto> {
    return this.menusService.updateMenuItem(id, itemId, dto, { id: user.id });
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Soft-delete a menu item (rejected if it still has active children)' })
  @ApiParam({ name: 'id', description: 'Menu id' })
  @ApiParam({ name: 'itemId' })
  @ApiWrappedResponse(MenuItemResponseDto)
  async deleteMenuItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MenuItemResponseDto> {
    return this.menusService.deleteMenuItem(id, itemId, { id: user.id });
  }

  @Post(':id/items/reorder')
  @ApiOperation({ summary: 'Bulk-update item positions (parentId/sortOrder) in one transaction' })
  @ApiParam({ name: 'id', description: 'Menu id' })
  @ApiWrappedResponse(MenuResponseDto)
  async reorderMenuItems(
    @Param('id') id: string,
    @Body() dto: ReorderMenuItemsDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MenuResponseDto> {
    await this.menusService.reorderMenuItems(id, dto, { id: user.id });
    return this.menusService.getMenu(id);
  }
}
