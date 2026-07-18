import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagMultiSelect } from './tag-multi-select';
import { useTagOptions } from '../hooks/use-tag-options';

vi.mock('../hooks/use-tag-options', () => ({ useTagOptions: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('TagMultiSelect', () => {
  it('shows a placeholder when nothing is selected', () => {
    vi.mocked(useTagOptions).mockReturnValue({
      data: { data: [{ id: 't1', name: 'Breaking', slug: 'breaking' }], meta: {} },
      isError: false,
    } as never);
    render(<TagMultiSelect value={[]} onChange={vi.fn()} />);
    expect(screen.getByText('Select tags…')).toBeInTheDocument();
  });

  it('shows selected tags as badges on the trigger', () => {
    vi.mocked(useTagOptions).mockReturnValue({
      data: { data: [{ id: 't1', name: 'Breaking', slug: 'breaking' }], meta: {} },
      isError: false,
    } as never);
    render(<TagMultiSelect value={['t1']} onChange={vi.fn()} />);
    expect(screen.getByText('Breaking')).toBeInTheDocument();
  });

  it('toggles a tag on checkbox click', async () => {
    vi.mocked(useTagOptions).mockReturnValue({
      data: { data: [{ id: 't1', name: 'Breaking', slug: 'breaking' }], meta: {} },
      isError: false,
    } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TagMultiSelect value={[]} onChange={onChange} />);

    await user.click(screen.getByText('Select tags…'));
    await user.click(await screen.findByText('Breaking'));

    expect(onChange).toHaveBeenCalledWith(['t1']);
  });

  it('shows a permission message instead of the selector when the query errors', () => {
    vi.mocked(useTagOptions).mockReturnValue({ data: undefined, isError: true } as never);
    render(<TagMultiSelect value={[]} onChange={vi.fn()} />);
    expect(screen.getByText("You don't have permission to view tags.")).toBeInTheDocument();
  });
});
