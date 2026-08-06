import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { reusableBlocksApi } from './reusable-blocks.api';
import type { ReusableBlock } from '../types/reusable-block';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

function buildReusableBlock(overrides: Partial<ReusableBlock> = {}): ReusableBlock {
  return {
    id: 'rb-1',
    name: 'Newsletter callout',
    description: null,
    category: null,
    blockType: 'callout',
    data: { text: 'Subscribe!' },
    children: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

describe('reusableBlocksApi', () => {
  it('list() calls api.getPaginated with the root path and filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await reusableBlocksApi.list({ page: 1, limit: 20, search: 'cta' });
    expect(api.getPaginated).toHaveBeenCalledWith('/content-blocks/reusable', {
      params: { page: 1, limit: 20, search: 'cta' },
    });
  });

  it('get() calls api.get with /content-blocks/reusable/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await reusableBlocksApi.get('rb-1');
    expect(api.get).toHaveBeenCalledWith('/content-blocks/reusable/rb-1');
  });

  it('create() calls api.post with the root path and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { name: 'CTA', blockType: 'callout', data: {} };
    await reusableBlocksApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/content-blocks/reusable', input);
  });

  it('update() calls api.patch with /content-blocks/reusable/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { name: 'New name' };
    await reusableBlocksApi.update('rb-1', input);
    expect(api.patch).toHaveBeenCalledWith('/content-blocks/reusable/rb-1', input);
  });

  it('remove() calls api.delete with /content-blocks/reusable/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await reusableBlocksApi.remove('rb-1');
    expect(api.delete).toHaveBeenCalledWith('/content-blocks/reusable/rb-1');
  });

  it('restore() calls api.post with /content-blocks/reusable/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await reusableBlocksApi.restore('rb-1');
    expect(api.post).toHaveBeenCalledWith('/content-blocks/reusable/rb-1/restore');
  });

  it('getUsages() calls api.get with /content-blocks/reusable/:id/usages', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await reusableBlocksApi.getUsages('rb-1');
    expect(api.get).toHaveBeenCalledWith('/content-blocks/reusable/rb-1/usages');
  });

  it('duplicate() composes create() from the source block with a new name, no separate endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const source = buildReusableBlock({
      children: [{ id: 'c1', type: 'paragraph', data: { text: 'hi' } }],
      description: 'Original description',
      category: 'Marketing',
    });
    await reusableBlocksApi.duplicate(source, 'Newsletter callout (copy)');
    expect(api.post).toHaveBeenCalledWith('/content-blocks/reusable', {
      name: 'Newsletter callout (copy)',
      blockType: 'callout',
      data: { text: 'Subscribe!' },
      children: [{ id: 'c1', type: 'paragraph', data: { text: 'hi' } }],
      description: 'Original description',
      category: 'Marketing',
    });
  });
});
