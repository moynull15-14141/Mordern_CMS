import { describe, expect, it, vi, beforeEach } from 'vitest';
import { commentsApi } from './comments.api';
import { api } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  api: {
    getPaginated: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('commentsApi', () => {
  it('lists comments through the root endpoint', async () => {
    vi.mocked(api.getPaginated).mockResolvedValueOnce({ data: [], meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } } });
    await commentsApi.list({ page: 1, limit: 20 });
    expect(api.getPaginated).toHaveBeenCalledWith('/comments', { params: { page: 1, limit: 20 } });
  });

  it('gets a comment by id', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ id: '1' });
    await commentsApi.get('1');
    expect(api.get).toHaveBeenCalledWith('/comments/1');
  });

  it('lists replies by comment id', async () => {
    vi.mocked(api.getPaginated).mockResolvedValueOnce({ data: [], meta: { pagination: { page: 1, limit: 10, total: 0, hasNext: false, hasPrevious: false } } });
    await commentsApi.replies('1', { page: 1, limit: 10 });
    expect(api.getPaginated).toHaveBeenCalledWith('/comments/1/replies', { params: { page: 1, limit: 10 } });
  });

  it('lists article comments through the article subresource', async () => {
    vi.mocked(api.getPaginated).mockResolvedValueOnce({ data: [], meta: { pagination: { page: 1, limit: 10, total: 0, hasNext: false, hasPrevious: false } } });
    await commentsApi.articleComments('article-1', { page: 1, limit: 10 });
    expect(api.getPaginated).toHaveBeenCalledWith('/articles/article-1/comments', { params: { page: 1, limit: 10 } });
  });

  it('lists user comments through the user subresource', async () => {
    vi.mocked(api.getPaginated).mockResolvedValueOnce({ data: [], meta: { pagination: { page: 1, limit: 10, total: 0, hasNext: false, hasPrevious: false } } });
    await commentsApi.userComments('user-1', { page: 1, limit: 10 });
    expect(api.getPaginated).toHaveBeenCalledWith('/users/user-1/comments', { params: { page: 1, limit: 10 } });
  });

  it('gets the article comment tree', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([]);
    await commentsApi.articleTree('article-1');
    expect(api.get).toHaveBeenCalledWith('/articles/article-1/comments/tree');
  });

  it('creates a comment', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ id: 'new' });
    await commentsApi.create({ articleId: 'article-1', body: 'Hello' });
    expect(api.post).toHaveBeenCalledWith('/comments', { articleId: 'article-1', body: 'Hello' });
  });

  it('updates a comment', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ id: '1' });
    await commentsApi.update('1', { body: 'Updated' });
    expect(api.patch).toHaveBeenCalledWith('/comments/1', { body: 'Updated' });
  });

  it('removes, restores, and moderates comments through real endpoints', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ id: '1' });
    vi.mocked(api.post).mockResolvedValue({ id: '1' });
    await commentsApi.remove('1');
    await commentsApi.restore('1');
    await commentsApi.approve('1', { reason: 'ok' });
    await commentsApi.reject('1', { reason: 'bad' });
    await commentsApi.spam('1', { reason: 'spam' });
    expect(api.delete).toHaveBeenCalledWith('/comments/1');
    expect(api.post).toHaveBeenNthCalledWith(1, '/comments/1/restore');
    expect(api.post).toHaveBeenNthCalledWith(2, '/comments/1/approve', { reason: 'ok' });
    expect(api.post).toHaveBeenNthCalledWith(3, '/comments/1/reject', { reason: 'bad' });
    expect(api.post).toHaveBeenNthCalledWith(4, '/comments/1/spam', { reason: 'spam' });
  });
});
