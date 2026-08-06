import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChecklistBlock } from './checklist-block';

describe('ChecklistBlock', () => {
  it('renders each item with its checked state', () => {
    render(
      <ChecklistBlock
        block={{
          id: 'b1',
          type: 'checklist',
          data: {
            items: [
              { text: 'Done thing', checked: true },
              { text: 'Todo thing', checked: false },
            ],
          },
        }}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('renders nothing for an empty checklist', () => {
    const { container } = render(
      <ChecklistBlock block={{ id: 'b1', type: 'checklist', data: {} }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
