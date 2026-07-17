import { CommentSortField } from '../constants/comment.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { CommentsService } from '../services/comments.service';
import { ArticleCommentsController } from './article-comments.controller';

function buildController() {
  const commentsService = {
    listArticleComments: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getArticleCommentTree: jest.fn().mockResolvedValue([]),
  } as unknown as CommentsService;
  const controller = new ArticleCommentsController(commentsService);
  return { controller, commentsService };
}

const user = { id: 'user-1' } as never;
const query = {
  page: 1,
  limit: 20,
  sortBy: CommentSortField.CREATED_AT,
  sortOrder: SortOrder.DESC,
} as never;

describe('ArticleCommentsController', () => {
  it('listArticleComments delegates with the article id, query, and actor', async () => {
    const { controller, commentsService } = buildController();
    await controller.listArticleComments('article-1', query, user);
    expect(commentsService.listArticleComments).toHaveBeenCalledWith(
      'article-1',
      expect.any(Object),
      { id: 'user-1' }
    );
  });

  it('getArticleCommentTree delegates with the article id only', async () => {
    const { controller, commentsService } = buildController();
    await controller.getArticleCommentTree('article-1');
    expect(commentsService.getArticleCommentTree).toHaveBeenCalledWith('article-1');
  });
});
