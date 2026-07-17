import { TagSortField } from '../constants/category.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { TagsService } from '../services/tags.service';
import { TagsController } from './tags.controller';

function buildController() {
  const tagsService = {
    listTags: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getTagBySlug: jest.fn().mockResolvedValue({}),
    getTag: jest.fn().mockResolvedValue({}),
    createTag: jest.fn().mockResolvedValue({}),
    updateTag: jest.fn().mockResolvedValue({}),
    deleteTag: jest.fn().mockResolvedValue({}),
    restoreTag: jest.fn().mockResolvedValue({}),
  } as unknown as TagsService;
  const controller = new TagsController(tagsService);
  return { controller, tagsService };
}

const user = { id: 'user-1' } as never;

describe('TagsController', () => {
  it('listTags builds query options and delegates to the service', async () => {
    const { controller, tagsService } = buildController();
    await controller.listTags({
      page: 1,
      limit: 20,
      sortBy: TagSortField.NAME,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(tagsService.listTags).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: TagSortField.NAME,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('getTagBySlug delegates with the slug param', async () => {
    const { controller, tagsService } = buildController();
    await controller.getTagBySlug('sports');
    expect(tagsService.getTagBySlug).toHaveBeenCalledWith('sports');
  });

  it('createTag passes the current user id as actor', async () => {
    const { controller, tagsService } = buildController();
    const dto = { name: 'Sports' } as never;
    await controller.createTag(dto, user);
    expect(tagsService.createTag).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateTag delegates with id, dto, and actor', async () => {
    const { controller, tagsService } = buildController();
    const dto = { name: 'Updated' } as never;
    await controller.updateTag('tag-1', dto, user);
    expect(tagsService.updateTag).toHaveBeenCalledWith('tag-1', dto, { id: 'user-1' });
  });

  it('deleteTag delegates with id and actor', async () => {
    const { controller, tagsService } = buildController();
    await controller.deleteTag('tag-1', user);
    expect(tagsService.deleteTag).toHaveBeenCalledWith('tag-1', { id: 'user-1' });
  });

  it('restoreTag delegates with id and actor', async () => {
    const { controller, tagsService } = buildController();
    await controller.restoreTag('tag-1', user);
    expect(tagsService.restoreTag).toHaveBeenCalledWith('tag-1', { id: 'user-1' });
  });
});
