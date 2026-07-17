import { Comment, CommentStatus } from '@prisma/client';
import { CommentsMapper } from './comments.mapper';

function buildComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'c1',
    articleId: 'article-1',
    userId: 'user-1',
    authorName: null,
    authorEmail: null,
    parentId: null,
    body: 'hello',
    status: CommentStatus.APPROVED,
    moderationReason: null,
    votes: 3,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Comment;
}

describe('CommentsMapper', () => {
  let mapper: CommentsMapper;

  beforeEach(() => {
    mapper = new CommentsMapper();
  });

  describe('toResponseDto', () => {
    it('maps all fields including the supplied replyCount', () => {
      const dto = mapper.toResponseDto(buildComment(), 4);
      expect(dto).toMatchObject({
        id: 'c1',
        articleId: 'article-1',
        userId: 'user-1',
        body: 'hello',
        status: CommentStatus.APPROVED,
        votes: 3,
        replyCount: 4,
      });
      expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(dto.deletedAt).toBeNull();
    });

    it('serializes deletedAt when set', () => {
      const dto = mapper.toResponseDto(
        buildComment({ deletedAt: new Date('2026-02-01T00:00:00.000Z') }),
        0
      );
      expect(dto.deletedAt).toBe('2026-02-01T00:00:00.000Z');
    });
  });

  describe('toTreeDtos', () => {
    it('builds a nested tree with correct replyCount per node', () => {
      const root = buildComment({ id: 'a', parentId: null });
      const child = buildComment({ id: 'a1', parentId: 'a' });
      const grandchild = buildComment({ id: 'a1a', parentId: 'a1' });

      const tree = mapper.toTreeDtos([root, child, grandchild]);

      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('a');
      expect(tree[0].replyCount).toBe(1);
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].id).toBe('a1');
      expect(tree[0].children[0].replyCount).toBe(1);
      expect(tree[0].children[0].children[0].id).toBe('a1a');
      expect(tree[0].children[0].children[0].replyCount).toBe(0);
    });

    it('returns an empty array for no comments', () => {
      expect(mapper.toTreeDtos([])).toEqual([]);
    });

    it('can build a subtree rooted at a non-null parent', () => {
      const root = buildComment({ id: 'a', parentId: null });
      const child = buildComment({ id: 'a1', parentId: 'a' });
      const tree = mapper.toTreeDtos([root, child], 'a');
      expect(tree.map((n) => n.id)).toEqual(['a1']);
    });
  });
});
