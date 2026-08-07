import { PatternsService } from '../services/patterns.service';
import { PatternsController } from './patterns.controller';
import { PatternSortField } from '../constants/patterns.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';

function buildController() {
  const patternsService = {
    listPatterns: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getPattern: jest.fn().mockResolvedValue({}),
    createPattern: jest.fn().mockResolvedValue({}),
    updatePattern: jest.fn().mockResolvedValue({}),
    duplicatePattern: jest.fn().mockResolvedValue({}),
    archivePattern: jest.fn().mockResolvedValue({}),
    unarchivePattern: jest.fn().mockResolvedValue({}),
    deletePattern: jest.fn().mockResolvedValue({}),
    restorePattern: jest.fn().mockResolvedValue({}),
    getUsages: jest.fn().mockResolvedValue([]),
  } as unknown as PatternsService;
  const controller = new PatternsController(patternsService);
  return { controller, patternsService };
}

const user = { id: 'user-1' } as never;

describe('PatternsController', () => {
  it('listPatterns builds query filters (splitting comma-separated tags) and delegates', async () => {
    const { controller, patternsService } = buildController();
    await controller.listPatterns({
      page: 1,
      limit: 20,
      sortBy: PatternSortField.NAME,
      sortOrder: SortOrder.ASC,
      category: 'Hero',
      tags: 'landing, marketing',
      search: 'banner',
    } as never);
    expect(patternsService.listPatterns).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          search: 'banner',
          category: 'Hero',
          tags: ['landing', 'marketing'],
          status: undefined,
        },
        page: 1,
        limit: 20,
        sortBy: PatternSortField.NAME,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('getPattern delegates with the id param', async () => {
    const { controller, patternsService } = buildController();
    await controller.getPattern('pattern-1');
    expect(patternsService.getPattern).toHaveBeenCalledWith('pattern-1');
  });

  it('createPattern passes the current user id as actor', async () => {
    const { controller, patternsService } = buildController();
    const dto = { name: 'Hero' } as never;
    await controller.createPattern(dto, user);
    expect(patternsService.createPattern).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updatePattern delegates with id/dto/actor', async () => {
    const { controller, patternsService } = buildController();
    const dto = { name: 'New Hero' } as never;
    await controller.updatePattern('pattern-1', dto, user);
    expect(patternsService.updatePattern).toHaveBeenCalledWith('pattern-1', dto, { id: 'user-1' });
  });

  it('duplicatePattern delegates with id/actor', async () => {
    const { controller, patternsService } = buildController();
    await controller.duplicatePattern('pattern-1', user);
    expect(patternsService.duplicatePattern).toHaveBeenCalledWith('pattern-1', { id: 'user-1' });
  });

  it('archivePattern / unarchivePattern delegate with id/actor', async () => {
    const { controller, patternsService } = buildController();
    await controller.archivePattern('pattern-1', user);
    await controller.unarchivePattern('pattern-1', user);
    expect(patternsService.archivePattern).toHaveBeenCalledWith('pattern-1', { id: 'user-1' });
    expect(patternsService.unarchivePattern).toHaveBeenCalledWith('pattern-1', { id: 'user-1' });
  });

  it('deletePattern / restorePattern delegate with id/actor', async () => {
    const { controller, patternsService } = buildController();
    await controller.deletePattern('pattern-1', user);
    await controller.restorePattern('pattern-1', user);
    expect(patternsService.deletePattern).toHaveBeenCalledWith('pattern-1', { id: 'user-1' });
    expect(patternsService.restorePattern).toHaveBeenCalledWith('pattern-1', { id: 'user-1' });
  });

  it('getUsages delegates with the id param', async () => {
    const { controller, patternsService } = buildController();
    await controller.getUsages('pattern-1');
    expect(patternsService.getUsages).toHaveBeenCalledWith('pattern-1');
  });
});
