import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { layoutAssignmentsApi } from './layout-assignments.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('layoutAssignmentsApi', () => {
  it('list() calls api.get with /layout-assignments and no params when contentType is omitted', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await layoutAssignmentsApi.list();
    expect(api.get).toHaveBeenCalledWith('/layout-assignments', { params: undefined });
  });

  it('list() passes contentType as a query param when given', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await layoutAssignmentsApi.list('PAGE');
    expect(api.get).toHaveBeenCalledWith('/layout-assignments', {
      params: { contentType: 'PAGE' },
    });
  });

  it('get() calls api.get with /layout-assignments/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await layoutAssignmentsApi.get('a1');
    expect(api.get).toHaveBeenCalledWith('/layout-assignments/a1');
  });

  it('assign() calls api.post with /layout-assignments and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { layoutId: 'l1', contentType: 'HOMEPAGE' as const };
    await layoutAssignmentsApi.assign(input);
    expect(api.post).toHaveBeenCalledWith('/layout-assignments', input);
  });

  it('unassign() calls api.delete with /layout-assignments/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await layoutAssignmentsApi.unassign('a1');
    expect(api.delete).toHaveBeenCalledWith('/layout-assignments/a1');
  });

  it('restore() calls api.post with /layout-assignments/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await layoutAssignmentsApi.restore('a1');
    expect(api.post).toHaveBeenCalledWith('/layout-assignments/a1/restore');
  });
});
