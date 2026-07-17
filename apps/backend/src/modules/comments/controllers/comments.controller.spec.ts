import { CommentSortField } from '../constants/comment.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { CommentsService } from '../services/comments.service';
import { CommentsController } from './comments.controller';

function buildController() {
  const commentsService = {
    listComments: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getComment: jest.fn().mockResolvedValue({}),
    listReplies: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    createComment: jest.fn().mockResolvedValue({}),
    updateComment: jest.fn().mockResolvedValue({}),
    deleteComment: jest.fn().mockResolvedValue({}),
    restoreComment: jest.fn().mockResolvedValue({}),
    approveComment: jest.fn().mockResolvedValue({}),
    rejectComment: jest.fn().mockResolvedValue({}),
    markSpam: jest.fn().mockResolvedValue({}),
  } as unknown as CommentsService;
  const controller = new CommentsController(commentsService);
  return { controller, commentsService };
}

const user = { id: 'user-1' } as never;

const query = {
  page: 1,
  limit: 20,
  sortBy: CommentSortField.CREATED_AT,
  sortOrder: SortOrder.DESC,
} as never;

describe('CommentsController', () => {
  it('listComments builds query options and delegates to the service', async () => {
    const { controller, commentsService } = buildController();
    await controller.listComments(query, user);
    expect(commentsService.listComments).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: CommentSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      }),
      { id: 'user-1' }
    );
  });

  it('getComment delegates with the id param', async () => {
    const { controller, commentsService } = buildController();
    await controller.getComment('c1');
    expect(commentsService.getComment).toHaveBeenCalledWith('c1');
  });

  it('listReplies delegates with the parent id and actor', async () => {
    const { controller, commentsService } = buildController();
    await controller.listReplies('c1', query, user);
    expect(commentsService.listReplies).toHaveBeenCalledWith('c1', expect.any(Object), {
      id: 'user-1',
    });
  });

  it('createComment delegates with the dto and actor', async () => {
    const { controller, commentsService } = buildController();
    const dto = { articleId: 'a1', body: 'hi' } as never;
    await controller.createComment(dto, user);
    expect(commentsService.createComment).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateComment delegates with id/dto/actor', async () => {
    const { controller, commentsService } = buildController();
    const dto = { body: 'edited' } as never;
    await controller.updateComment('c1', dto, user);
    expect(commentsService.updateComment).toHaveBeenCalledWith('c1', dto, { id: 'user-1' });
  });

  it('deleteComment delegates with id/actor', async () => {
    const { controller, commentsService } = buildController();
    await controller.deleteComment('c1', user);
    expect(commentsService.deleteComment).toHaveBeenCalledWith('c1', { id: 'user-1' });
  });

  it('restoreComment delegates with id/actor', async () => {
    const { controller, commentsService } = buildController();
    await controller.restoreComment('c1', user);
    expect(commentsService.restoreComment).toHaveBeenCalledWith('c1', { id: 'user-1' });
  });

  it('approveComment delegates with id/dto/actor', async () => {
    const { controller, commentsService } = buildController();
    const dto = { reason: 'ok' } as never;
    await controller.approveComment('c1', dto, user);
    expect(commentsService.approveComment).toHaveBeenCalledWith('c1', dto, { id: 'user-1' });
  });

  it('rejectComment delegates with id/dto/actor', async () => {
    const { controller, commentsService } = buildController();
    const dto = { reason: 'bad' } as never;
    await controller.rejectComment('c1', dto, user);
    expect(commentsService.rejectComment).toHaveBeenCalledWith('c1', dto, { id: 'user-1' });
  });

  it('markSpam delegates with id/dto/actor', async () => {
    const { controller, commentsService } = buildController();
    const dto = {} as never;
    await controller.markSpam('c1', dto, user);
    expect(commentsService.markSpam).toHaveBeenCalledWith('c1', dto, { id: 'user-1' });
  });
});
