import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { sessionsApi } from './sessions.api';

vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('sessionsApi', () => {
  it('list() calls api.get with /users/:id/sessions', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await sessionsApi.list('u1');
    expect(api.get).toHaveBeenCalledWith('/users/u1/sessions');
  });

  it('terminate() calls api.delete with /users/:id/sessions/:sessionId', async () => {
    vi.mocked(api.delete).mockResolvedValue({ message: 'ok' });
    await sessionsApi.terminate('u1', 's1');
    expect(api.delete).toHaveBeenCalledWith('/users/u1/sessions/s1');
  });

  it('terminateAll() calls api.delete with /users/:id/sessions', async () => {
    vi.mocked(api.delete).mockResolvedValue({ message: 'ok' });
    await sessionsApi.terminateAll('u1');
    expect(api.delete).toHaveBeenCalledWith('/users/u1/sessions');
  });
});
