import { MediaFolderSortField } from '../constants/media.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { MediaFolderService } from '../services/media-folder.service';
import { MediaFolderController } from './media-folder.controller';

function buildController() {
  const mediaFolderService = {
    listFolders: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getTree: jest.fn().mockResolvedValue([]),
    getFolder: jest.fn().mockResolvedValue({}),
    getChildren: jest.fn().mockResolvedValue([]),
    getDescendants: jest.fn().mockResolvedValue([]),
    getAncestors: jest.fn().mockResolvedValue([]),
    getBreadcrumb: jest.fn().mockResolvedValue([]),
    createFolder: jest.fn().mockResolvedValue({}),
    updateFolder: jest.fn().mockResolvedValue({}),
    moveFolder: jest.fn().mockResolvedValue({}),
    deleteFolder: jest.fn().mockResolvedValue({}),
    restoreFolder: jest.fn().mockResolvedValue({}),
  } as unknown as MediaFolderService;
  const controller = new MediaFolderController(mediaFolderService);
  return { controller, mediaFolderService };
}

const user = { id: 'user-1' } as never;

describe('MediaFolderController', () => {
  it('listFolders builds query options and delegates to the service', async () => {
    const { controller, mediaFolderService } = buildController();
    await controller.listFolders({
      page: 1,
      limit: 20,
      sortBy: MediaFolderSortField.NAME,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(mediaFolderService.listFolders).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: MediaFolderSortField.NAME,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('getTree delegates to the service', async () => {
    const { controller, mediaFolderService } = buildController();
    await controller.getTree();
    expect(mediaFolderService.getTree).toHaveBeenCalled();
  });

  it('getChildren delegates with the id param', async () => {
    const { controller, mediaFolderService } = buildController();
    await controller.getChildren('folder-1');
    expect(mediaFolderService.getChildren).toHaveBeenCalledWith('folder-1');
  });

  it('getBreadcrumb delegates with the id param', async () => {
    const { controller, mediaFolderService } = buildController();
    await controller.getBreadcrumb('folder-1');
    expect(mediaFolderService.getBreadcrumb).toHaveBeenCalledWith('folder-1');
  });

  it('createFolder passes the current user id as actor', async () => {
    const { controller, mediaFolderService } = buildController();
    const dto = { name: 'Photos' } as never;
    await controller.createFolder(dto, user);
    expect(mediaFolderService.createFolder).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateFolder delegates with id, dto, and actor', async () => {
    const { controller, mediaFolderService } = buildController();
    const dto = { name: 'Updated' } as never;
    await controller.updateFolder('folder-1', dto, user);
    expect(mediaFolderService.updateFolder).toHaveBeenCalledWith('folder-1', dto, { id: 'user-1' });
  });

  it('moveFolder delegates with id, dto, and actor', async () => {
    const { controller, mediaFolderService } = buildController();
    const dto = { parentId: 'new-parent' };
    await controller.moveFolder('folder-1', dto, user);
    expect(mediaFolderService.moveFolder).toHaveBeenCalledWith('folder-1', dto, { id: 'user-1' });
  });

  it('deleteFolder delegates with id and actor', async () => {
    const { controller, mediaFolderService } = buildController();
    await controller.deleteFolder('folder-1', user);
    expect(mediaFolderService.deleteFolder).toHaveBeenCalledWith('folder-1', { id: 'user-1' });
  });

  it('restoreFolder delegates with id and actor', async () => {
    const { controller, mediaFolderService } = buildController();
    await controller.restoreFolder('folder-1', user);
    expect(mediaFolderService.restoreFolder).toHaveBeenCalledWith('folder-1', { id: 'user-1' });
  });
});
