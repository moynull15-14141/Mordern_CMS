import { ForbiddenException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UsersController } from './users.controller';
import { UserSortField } from '../constants/user.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';

function buildController() {
  const usersService = {
    listUsers: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getUser: jest.fn().mockResolvedValue({}),
    createUser: jest.fn().mockResolvedValue({}),
    updateUser: jest.fn().mockResolvedValue({}),
    softDeleteUser: jest.fn().mockResolvedValue({}),
    restoreUser: jest.fn().mockResolvedValue({}),
    lockUser: jest.fn().mockResolvedValue({}),
    unlockUser: jest.fn().mockResolvedValue({}),
    deactivateUser: jest.fn().mockResolvedValue({}),
    activateUser: jest.fn().mockResolvedValue({}),
    changePassword: jest.fn().mockResolvedValue(undefined),
    adminResetPassword: jest.fn().mockResolvedValue(undefined),
    getSessions: jest.fn().mockResolvedValue([]),
    terminateSession: jest.fn().mockResolvedValue(undefined),
    terminateAllSessions: jest.fn().mockResolvedValue(undefined),
    updateProfile: jest.fn().mockResolvedValue({}),
    updatePreferences: jest.fn().mockResolvedValue({}),
    updateAvatar: jest.fn().mockResolvedValue({}),
    removeAvatar: jest.fn().mockResolvedValue({}),
  } as unknown as UsersService;
  const controller = new UsersController(usersService);
  return { controller, usersService };
}

const user = { id: 'user-1' } as never;

describe('UsersController', () => {
  it('listUsers builds query options and delegates to the service', async () => {
    const { controller, usersService } = buildController();
    await controller.listUsers({
      page: 2,
      limit: 10,
      sortBy: UserSortField.EMAIL,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(usersService.listUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 10,
        sortBy: UserSortField.EMAIL,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('getMe delegates to getUser with the current user id', async () => {
    const { controller, usersService } = buildController();
    await controller.getMe(user);
    expect(usersService.getUser).toHaveBeenCalledWith('user-1');
  });

  it('changePassword allows a user to change their own password', async () => {
    const { controller, usersService } = buildController();
    const dto = { currentPassword: 'a', newPassword: 'B' } as never;
    await controller.changePassword('user-1', dto, user);
    expect(usersService.changePassword).toHaveBeenCalledWith('user-1', dto);
  });

  it("changePassword rejects changing someone else's password", async () => {
    const { controller } = buildController();
    const dto = { currentPassword: 'a', newPassword: 'B' } as never;
    await expect(controller.changePassword('someone-else', dto, user)).rejects.toThrow(
      ForbiddenException
    );
  });

  it('resetPassword (admin) does not check ownership', async () => {
    const { controller, usersService } = buildController();
    const dto = { newPassword: 'B' } as never;
    await controller.resetPassword('someone-else', dto, user);
    expect(usersService.adminResetPassword).toHaveBeenCalledWith('someone-else', dto, 'user-1');
  });

  it('terminateSession delegates with both ids', async () => {
    const { controller, usersService } = buildController();
    await controller.terminateSession('user-1', 'session-1', user);
    expect(usersService.terminateSession).toHaveBeenCalledWith('user-1', 'session-1', 'user-1');
  });

  it('updateMyProfile delegates to updateProfile with the current user id', async () => {
    const { controller, usersService } = buildController();
    const dto = { firstName: 'A' } as never;
    await controller.updateMyProfile(dto, user);
    expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', dto);
  });

  it('updateMyAvatar delegates to updateAvatar with the current user id', async () => {
    const { controller, usersService } = buildController();
    const dto = { mediaAssetId: 'media-1' } as never;
    await controller.updateMyAvatar(dto, user);
    expect(usersService.updateAvatar).toHaveBeenCalledWith('user-1', dto);
  });

  it('removeMyAvatar delegates to removeAvatar with the current user id', async () => {
    const { controller, usersService } = buildController();
    await controller.removeMyAvatar(user);
    expect(usersService.removeAvatar).toHaveBeenCalledWith('user-1');
  });
});
