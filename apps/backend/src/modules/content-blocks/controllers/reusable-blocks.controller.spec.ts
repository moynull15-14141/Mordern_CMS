import { ReusableBlockSortField } from '../constants/reusable-block.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { ReusableBlocksService } from '../services/reusable-blocks.service';
import { ReusableBlocksController } from './reusable-blocks.controller';

function buildController() {
  const reusableBlocksService = {
    listReusableBlocks: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getReusableBlock: jest.fn().mockResolvedValue({}),
    createReusableBlock: jest.fn().mockResolvedValue({}),
    updateReusableBlock: jest.fn().mockResolvedValue({}),
    deleteReusableBlock: jest.fn().mockResolvedValue({}),
    restoreReusableBlock: jest.fn().mockResolvedValue({}),
    getUsages: jest.fn().mockResolvedValue([]),
  } as unknown as ReusableBlocksService;
  const controller = new ReusableBlocksController(reusableBlocksService);
  return { controller, reusableBlocksService };
}

const user = { id: 'user-1' } as never;

describe('ReusableBlocksController', () => {
  it('listReusableBlocks builds query options and delegates to the service', async () => {
    const { controller, reusableBlocksService } = buildController();
    await controller.listReusableBlocks({
      page: 1,
      limit: 20,
      sortBy: ReusableBlockSortField.NAME,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(reusableBlocksService.listReusableBlocks).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: ReusableBlockSortField.NAME,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('getReusableBlock delegates with the id param', async () => {
    const { controller, reusableBlocksService } = buildController();
    await controller.getReusableBlock('block-1');
    expect(reusableBlocksService.getReusableBlock).toHaveBeenCalledWith('block-1');
  });

  it('createReusableBlock passes the current user id as actor', async () => {
    const { controller, reusableBlocksService } = buildController();
    const dto = { name: 'CTA', blockType: 'callout', data: {} } as never;
    await controller.createReusableBlock(dto, user);
    expect(reusableBlocksService.createReusableBlock).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateReusableBlock passes id, dto, and actor', async () => {
    const { controller, reusableBlocksService } = buildController();
    const dto = { name: 'New name' } as never;
    await controller.updateReusableBlock('block-1', dto, user);
    expect(reusableBlocksService.updateReusableBlock).toHaveBeenCalledWith('block-1', dto, {
      id: 'user-1',
    });
  });

  it('deleteReusableBlock delegates with id and actor', async () => {
    const { controller, reusableBlocksService } = buildController();
    await controller.deleteReusableBlock('block-1', user);
    expect(reusableBlocksService.deleteReusableBlock).toHaveBeenCalledWith('block-1', {
      id: 'user-1',
    });
  });

  it('restoreReusableBlock delegates with id and actor', async () => {
    const { controller, reusableBlocksService } = buildController();
    await controller.restoreReusableBlock('block-1', user);
    expect(reusableBlocksService.restoreReusableBlock).toHaveBeenCalledWith('block-1', {
      id: 'user-1',
    });
  });

  it('getUsages delegates with the id param', async () => {
    const { controller, reusableBlocksService } = buildController();
    await controller.getUsages('block-1');
    expect(reusableBlocksService.getUsages).toHaveBeenCalledWith('block-1');
  });
});
