import { MediaSortField } from '../constants/media.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { MediaService } from '../services/media.service';
import { MediaController } from './media.controller';

function buildController() {
  const mediaService = {
    listMediaAssets: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getMediaAsset: jest.fn().mockResolvedValue({}),
    getUsages: jest.fn().mockResolvedValue([]),
    findDuplicates: jest.fn().mockResolvedValue([]),
    createMediaAsset: jest.fn().mockResolvedValue({}),
    updateMediaAsset: jest.fn().mockResolvedValue({}),
    renameMediaAsset: jest.fn().mockResolvedValue({}),
    moveMediaAsset: jest.fn().mockResolvedValue({}),
    copyMetadata: jest.fn().mockResolvedValue({}),
    deleteMediaAsset: jest.fn().mockResolvedValue({}),
    restoreMediaAsset: jest.fn().mockResolvedValue({}),
  } as unknown as MediaService;
  const controller = new MediaController(mediaService);
  return { controller, mediaService };
}

const user = { id: 'user-1' } as never;

describe('MediaController', () => {
  it('listMedia builds query options and delegates to the service', async () => {
    const { controller, mediaService } = buildController();
    await controller.listMedia({
      page: 1,
      limit: 20,
      sortBy: MediaSortField.FILENAME,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(mediaService.listMediaAssets).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: MediaSortField.FILENAME,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('getMedia delegates with the id param', async () => {
    const { controller, mediaService } = buildController();
    await controller.getMedia('media-1');
    expect(mediaService.getMediaAsset).toHaveBeenCalledWith('media-1');
  });

  it('getUsages delegates with the id param', async () => {
    const { controller, mediaService } = buildController();
    await controller.getUsages('media-1');
    expect(mediaService.getUsages).toHaveBeenCalledWith('media-1');
  });

  it('getDuplicates delegates with the id param', async () => {
    const { controller, mediaService } = buildController();
    await controller.getDuplicates('media-1');
    expect(mediaService.findDuplicates).toHaveBeenCalledWith('media-1');
  });

  it('createMedia passes the current user id as actor', async () => {
    const { controller, mediaService } = buildController();
    const dto = { storageKey: 'k.png' } as never;
    await controller.createMedia(dto, user);
    expect(mediaService.createMediaAsset).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateMedia delegates with id, dto, and actor', async () => {
    const { controller, mediaService } = buildController();
    const dto = { altText: 'x' } as never;
    await controller.updateMedia('media-1', dto, user);
    expect(mediaService.updateMediaAsset).toHaveBeenCalledWith('media-1', dto, { id: 'user-1' });
  });

  it('renameMedia delegates with id, dto, and actor', async () => {
    const { controller, mediaService } = buildController();
    const dto = { filename: 'New.png' };
    await controller.renameMedia('media-1', dto, user);
    expect(mediaService.renameMediaAsset).toHaveBeenCalledWith('media-1', dto, { id: 'user-1' });
  });

  it('moveMedia delegates with id, dto, and actor', async () => {
    const { controller, mediaService } = buildController();
    const dto = { folderId: 'folder-1' };
    await controller.moveMedia('media-1', dto, user);
    expect(mediaService.moveMediaAsset).toHaveBeenCalledWith('media-1', dto, { id: 'user-1' });
  });

  it('copyMetadata delegates with source id, dto, and actor', async () => {
    const { controller, mediaService } = buildController();
    const dto = { targetId: 'media-2' };
    await controller.copyMetadata('media-1', dto, user);
    expect(mediaService.copyMetadata).toHaveBeenCalledWith('media-1', dto, { id: 'user-1' });
  });

  it('deleteMedia delegates with id and actor', async () => {
    const { controller, mediaService } = buildController();
    await controller.deleteMedia('media-1', user);
    expect(mediaService.deleteMediaAsset).toHaveBeenCalledWith('media-1', { id: 'user-1' });
  });

  it('restoreMedia delegates with id and actor', async () => {
    const { controller, mediaService } = buildController();
    await controller.restoreMedia('media-1', user);
    expect(mediaService.restoreMediaAsset).toHaveBeenCalledWith('media-1', { id: 'user-1' });
  });
});
