import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReusableBlockRenderer } from './reusable-block';

const { getReusableBlockMock } = vi.hoisted(() => ({ getReusableBlockMock: vi.fn() }));

vi.mock('../../services/content-blocks.service', () => ({
  getReusableBlock: getReusableBlockMock,
}));

/**
 * `ReusableBlockRenderer` is an async Server Component — `@testing-library/react`'s
 * `render()` (backed by the client `react-dom` reconciler) can't await a
 * component function directly, so each test calls it as a plain async
 * function first (resolving its returned element), then hands the
 * resolved element to `render()`. Standard pattern for testing async RSCs
 * outside a real server render.
 */
describe('ReusableBlockRenderer', () => {
  beforeEach(() => {
    getReusableBlockMock.mockReset();
  });

  it('resolves the reference and renders it through the block registry', async () => {
    getReusableBlockMock.mockResolvedValue({
      id: 'rb-1',
      blockType: 'callout',
      data: { text: 'Hi there' },
    });
    const element = await ReusableBlockRenderer({
      block: { id: 'b1', type: 'reusable-block', data: { reusableBlockId: 'rb-1' } },
    });
    render(<>{element}</>);
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    expect(getReusableBlockMock).toHaveBeenCalledWith('rb-1');
  });

  it('renders nothing for a dangling reference (getReusableBlock resolves null)', async () => {
    getReusableBlockMock.mockResolvedValue(null);
    const element = await ReusableBlockRenderer({
      block: { id: 'b1', type: 'reusable-block', data: { reusableBlockId: 'missing' } },
    });
    expect(element).toBeNull();
  });

  it('renders nothing when reusableBlockId is missing (never calls the service)', async () => {
    const element = await ReusableBlockRenderer({
      block: { id: 'b1', type: 'reusable-block', data: {} },
    });
    expect(element).toBeNull();
    expect(getReusableBlockMock).not.toHaveBeenCalled();
  });

  it('renders nothing to prevent infinite recursion when the resolved block is itself a reusable-block reference', async () => {
    getReusableBlockMock.mockResolvedValue({ id: 'rb-1', blockType: 'reusable-block', data: {} });
    const element = await ReusableBlockRenderer({
      block: { id: 'b1', type: 'reusable-block', data: { reusableBlockId: 'rb-1' } },
    });
    expect(element).toBeNull();
  });

  it('renders a resolved container block’s children (Milestone 4: reusable blocks now carry children)', async () => {
    getReusableBlockMock.mockResolvedValue({
      id: 'rb-1',
      blockType: 'container',
      data: {},
      children: [{ id: 'c1', type: 'paragraph', data: { text: 'Nested paragraph' } }],
    });
    const element = await ReusableBlockRenderer({
      block: { id: 'b1', type: 'reusable-block', data: { reusableBlockId: 'rb-1' } },
    });
    render(<>{element}</>);
    expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
  });
});
