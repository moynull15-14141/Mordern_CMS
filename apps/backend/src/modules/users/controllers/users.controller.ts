import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { MessageResponseDto } from '../../identity/dto/message-response.dto';
import { UsersService } from '../services/users.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { SessionResponseDto } from '../dto/session-response.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { UpdateAvatarDto } from '../dto/update-avatar.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AdminResetPasswordDto } from '../dto/admin-reset-password.dto';
import { LockUserDto } from '../dto/lock-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * User Management foundation (Milestone 7). Admin endpoints (`/users`,
 * `/users/:id/*`) require the single frozen `users.manage` permission — no
 * view/create/delete split exists (see docs/42_USER_MANAGEMENT_ARCHITECTURE.md
 * "Permission Conflict"). Self-service endpoints (`/users/me*`,
 * `/users/:id/change-password` when acting on one's own id) require only
 * authentication (global JwtAuthGuard), matching the precedent set by
 * `AuthorizationController.getMyAuthorization()` in Milestone 5.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'List/search/filter/sort users (paginated)' })
  @ApiWrappedResponse(UserResponseDto, { isArray: true })
  async listUsers(@Query() query: UserQueryDto): Promise<PaginatedResult<UserResponseDto>> {
    return this.usersService.listUsers({
      filters: {
        email: query.email,
        username: query.username,
        displayName: query.displayName,
        role: query.role,
        status: query.status,
        search: query.search,
        createdFrom: query.createdFrom ? new Date(query.createdFrom) : undefined,
        createdTo: query.createdTo ? new Date(query.createdTo) : undefined,
        updatedFrom: query.updatedFrom ? new Date(query.updatedFrom) : undefined,
        updatedTo: query.updatedTo ? new Date(query.updatedTo) : undefined,
      },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiWrappedResponse(UserResponseDto)
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.usersService.getUser(user.id);
  }

  @Get(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(UserResponseDto)
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.getUser(id);
  }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Create a user' })
  @ApiWrappedResponse(UserResponseDto)
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.createUser(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Update a user (identity fields only)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(UserResponseDto)
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Soft-delete a user' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(UserResponseDto)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.softDeleteUser(id, user.id);
  }

  @Post(':id/restore')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Restore a soft-deleted user' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(UserResponseDto)
  async restoreUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.restoreUser(id, user.id);
  }

  @Post(':id/lock')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({
    summary:
      'Lock a user (tracked in metadata, not the frozen UserStatus enum) and revoke their sessions',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(UserResponseDto)
  async lockUser(
    @Param('id') id: string,
    @Body() dto: LockUserDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.lockUser(id, dto.reason, user.id);
  }

  @Post(':id/unlock')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Unlock a user' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(UserResponseDto)
  async unlockUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.unlockUser(id, user.id);
  }

  @Post(':id/deactivate')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Deactivate a user (status = INACTIVE) and revoke their sessions' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(UserResponseDto)
  async deactivateUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.deactivateUser(id, user.id);
  }

  @Post(':id/activate')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Activate a user (status = ACTIVE)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(UserResponseDto)
  async activateUser(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.activateUser(id, user.id);
  }

  @Post(':id/change-password')
  @ApiOperation({
    summary: 'Change your own password (requires current password); self-service only',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MessageResponseDto)
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MessageResponseDto> {
    if (id !== user.id) {
      throw new ForbiddenException('You can only change your own password.');
    }
    await this.usersService.changePassword(id, dto);
    return { message: 'Password changed. All sessions have been logged out.' };
  }

  @Post(':id/reset-password')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: "Admin reset of a user's password (no current password required)" })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MessageResponseDto)
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: AdminResetPasswordDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MessageResponseDto> {
    await this.usersService.adminResetPassword(id, dto, user.id);
    return { message: 'Password reset. All sessions have been logged out.' };
  }

  @Get(':id/sessions')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: "List a user's sessions" })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(SessionResponseDto, { isArray: true })
  async getSessions(@Param('id') id: string): Promise<SessionResponseDto[]> {
    return this.usersService.getSessions(id);
  }

  @Delete(':id/sessions/:sessionId')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: 'Terminate one session' })
  @ApiParam({ name: 'id' })
  @ApiParam({ name: 'sessionId' })
  @ApiWrappedResponse(MessageResponseDto)
  async terminateSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MessageResponseDto> {
    await this.usersService.terminateSession(id, sessionId, user.id);
    return { message: 'Session terminated.' };
  }

  @Delete(':id/sessions')
  @UseGuards(PermissionGuard)
  @RequirePermission(PERMISSIONS.USERS_MANAGE)
  @ApiOperation({ summary: "Terminate all of a user's sessions (force logout)" })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MessageResponseDto)
  async terminateAllSessions(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MessageResponseDto> {
    await this.usersService.terminateAllSessions(id, user.id);
    return { message: 'All sessions terminated.' };
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update your own profile' })
  @ApiWrappedResponse(UserResponseDto)
  async updateMyProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update your own preferences' })
  @ApiWrappedResponse(UserResponseDto)
  async updateMyPreferences(
    @Body() dto: UpdatePreferencesDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.updatePreferences(user.id, dto);
  }

  @Patch('me/avatar')
  @ApiOperation({
    summary: 'Set your avatar to an existing MediaAsset (metadata only — no upload)',
  })
  @ApiWrappedResponse(UserResponseDto)
  async updateMyAvatar(
    @Body() dto: UpdateAvatarDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UserResponseDto> {
    return this.usersService.updateAvatar(user.id, dto);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Remove your avatar' })
  @ApiWrappedResponse(UserResponseDto)
  async removeMyAvatar(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.usersService.removeAvatar(user.id);
  }
}
