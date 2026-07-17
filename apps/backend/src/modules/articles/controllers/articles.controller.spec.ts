import { ArticleSortField } from '../constants/article.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { ArticlesService } from '../services/articles.service';
import { ArticlesController } from './articles.controller';

function buildController() {
  const articlesService = {
    listArticles: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getArticleBySlug: jest.fn().mockResolvedValue({}),
    getArticle: jest.fn().mockResolvedValue({}),
    createArticle: jest.fn().mockResolvedValue({}),
    updateArticle: jest.fn().mockResolvedValue({}),
    deleteArticle: jest.fn().mockResolvedValue({}),
    restoreArticle: jest.fn().mockResolvedValue({}),
    publishArticle: jest.fn().mockResolvedValue({}),
    scheduleArticle: jest.fn().mockResolvedValue({}),
    listRevisions: jest.fn().mockResolvedValue([]),
    compareRevisions: jest.fn().mockResolvedValue({}),
    restoreRevision: jest.fn().mockResolvedValue({}),
  } as unknown as ArticlesService;
  const controller = new ArticlesController(articlesService);
  return { controller, articlesService };
}

const user = { id: 'user-1' } as never;

describe('ArticlesController', () => {
  it('listArticles builds query options and delegates to the service', async () => {
    const { controller, articlesService } = buildController();
    await controller.listArticles({
      page: 1,
      limit: 20,
      sortBy: ArticleSortField.TITLE,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(articlesService.listArticles).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: ArticleSortField.TITLE,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('getArticleBySlug delegates with the slug param', async () => {
    const { controller, articlesService } = buildController();
    await controller.getArticleBySlug('hello-world');
    expect(articlesService.getArticleBySlug).toHaveBeenCalledWith('hello-world');
  });

  it('createArticle passes the current user id as actor', async () => {
    const { controller, articlesService } = buildController();
    const dto = { title: 'T' } as never;
    await controller.createArticle(dto, user);
    expect(articlesService.createArticle).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateArticle passes id, dto, and actor', async () => {
    const { controller, articlesService } = buildController();
    const dto = { title: 'New' } as never;
    await controller.updateArticle('article-1', dto, user);
    expect(articlesService.updateArticle).toHaveBeenCalledWith('article-1', dto, { id: 'user-1' });
  });

  it('deleteArticle delegates with id and actor', async () => {
    const { controller, articlesService } = buildController();
    await controller.deleteArticle('article-1', user);
    expect(articlesService.deleteArticle).toHaveBeenCalledWith('article-1', { id: 'user-1' });
  });

  it('publishArticle delegates with id and actor', async () => {
    const { controller, articlesService } = buildController();
    await controller.publishArticle('article-1', user);
    expect(articlesService.publishArticle).toHaveBeenCalledWith('article-1', { id: 'user-1' });
  });

  it('scheduleArticle delegates with id, dto, and actor', async () => {
    const { controller, articlesService } = buildController();
    const dto = { scheduledAt: '2099-01-01T00:00:00.000Z' };
    await controller.scheduleArticle('article-1', dto, user);
    expect(articlesService.scheduleArticle).toHaveBeenCalledWith('article-1', dto, {
      id: 'user-1',
    });
  });

  it('compareRevisions parses from/to as integers', async () => {
    const { controller, articlesService } = buildController();
    await controller.compareRevisions('article-1', 1, 2);
    expect(articlesService.compareRevisions).toHaveBeenCalledWith('article-1', 1, 2);
  });

  it('restoreRevision delegates with id, version, and actor', async () => {
    const { controller, articlesService } = buildController();
    await controller.restoreRevision('article-1', 3, user);
    expect(articlesService.restoreRevision).toHaveBeenCalledWith('article-1', 3, { id: 'user-1' });
  });
});
