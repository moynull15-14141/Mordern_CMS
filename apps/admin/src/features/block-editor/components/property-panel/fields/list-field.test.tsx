import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListField } from './list-field';

const descriptor = {
  key: 'items',
  label: 'Items',
  kind: 'list' as const,
  itemFields: [{ key: 'text', label: 'Text', kind: 'text' as const, required: true }],
};

describe('ListField', () => {
  it('renders one nested field group per item', () => {
    render(
      <ListField
        descriptor={descriptor}
        value={[{ text: 'One' }, { text: 'Two' }]}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('One')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Two')).toBeInTheDocument();
  });

  it('adds a new blank item seeded from itemFields defaults', async () => {
    const onChange = vi.fn();
    render(<ListField descriptor={descriptor} value={[]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Add Item/ }));
    expect(onChange).toHaveBeenCalledWith([{ text: '' }]);
  });

  it('removes an item', async () => {
    const onChange = vi.fn();
    render(
      <ListField
        descriptor={descriptor}
        value={[{ text: 'One' }, { text: 'Two' }]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove item' })[0]);
    expect(onChange).toHaveBeenCalledWith([{ text: 'Two' }]);
  });

  it('reorders items with move up/down', async () => {
    const onChange = vi.fn();
    render(
      <ListField
        descriptor={descriptor}
        value={[{ text: 'One' }, { text: 'Two' }]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getAllByRole('button', { name: 'Move down' })[0]);
    expect(onChange).toHaveBeenCalledWith([{ text: 'Two' }, { text: 'One' }]);
  });

  it('disables move-up on the first item and move-down on the last', () => {
    render(
      <ListField
        descriptor={descriptor}
        value={[{ text: 'One' }, { text: 'Two' }]}
        onChange={vi.fn()}
      />
    );
    const upButtons = screen.getAllByRole('button', { name: 'Move up' });
    const downButtons = screen.getAllByRole('button', { name: 'Move down' });
    expect(upButtons[0]).toBeDisabled();
    expect(downButtons.at(-1)).toBeDisabled();
  });

  it('recurses for nested list fields (table-style rows-of-cells)', () => {
    const nestedDescriptor = {
      key: 'rows',
      label: 'Rows',
      kind: 'list' as const,
      itemFields: [
        {
          key: 'cells',
          label: 'Cells',
          kind: 'list' as const,
          itemFields: [{ key: 'text', label: 'Text', kind: 'text' as const, required: true }],
        },
      ],
    };
    render(
      <ListField
        descriptor={nestedDescriptor}
        value={[{ cells: [{ text: 'A' }] }]}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('A')).toBeInTheDocument();
  });
});
