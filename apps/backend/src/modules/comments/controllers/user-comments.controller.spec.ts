import { CommentSortField } from '../constants/comment.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { CommentsService } from '../services/comments.service';
import { UserCommentsController } from './user-comments.controller';

function buildController() {
  const commentsService = {
    listUserComments: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
  } as unknown as CommentsService;
  const controller = new UserCommentsController(commentsService);
  return { controller, commentsService };
}

const user = { id: 'user-1' } as never;
const query = {
  page: 1,
  limit: 20,
  sortBy: CommentSortField.CREATED_AT,
  sortOrder: SortOrder.DESC,
} as never;

describe('UserCommentsController', () => {
  it('listUserComments delegates with the user id, query, and actor', async () => {
    const { controller, commentsService } = buildController();
    await controller.listUserComments('target-user-1', query, user);
    expect(commentsService.listUserComments).toHaveBeenCalledWith(
      'target-user-1',
      expect.any(Object),
      { id: 'user-1' }
    );
  });
});
