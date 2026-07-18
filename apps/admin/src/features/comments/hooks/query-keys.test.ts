import { describe, expect, it } from 'vitest';
import { commentsKeys } from './query-keys';

describe('commentsKeys', () => {
  it('builds list keys from filters', () => {
    expect(commentsKeys.list({ page: 1, limit: 20 })).toEqual(['comments', 'list', { page: 1, limit: 20 }]);
  });

  it('builds detail keys', () => {
    expect(commentsKeys.detail('comment-1')).toEqual(['comments', 'detail', 'comment-1']);
  });

  it('builds replies keys', () => {
    expect(commentsKeys.replies('comment-1', { page: 1, limit: 10 })).toEqual([
      'comments',
      'comment-1',
      'replies',
      { page: 1, limit: 10 },
    ]);
  });

  it('builds article and user scoped keys', () => {
    expect(commentsKeys.articleComments('article-1', { page: 2 })).toEqual([
      'comments',
      'article',
      'article-1',
      { page: 2 },
    ]);
    expect(commentsKeys.articleTree('article-1')).toEqual(['comments', 'article', 'article-1', 'tree']);
    expect(commentsKeys.userComments('user-1', { search: 'hello' })).toEqual([
      'comments',
      'user',
      'user-1',
      { search: 'hello' },
    ]);
  });
});
