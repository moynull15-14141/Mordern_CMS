import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabsBlock } from './tabs-block';

describe('TabsBlock', () => {
  it('shows the first tab active by default and switches on click', async () => {
    const user = userEvent.setup();
    render(
      <TabsBlock
        block={{
          id: 'b1',
          type: 'tabs',
          data: { tabs: [{ label: 'First' }, { label: 'Second' }] },
          children: [
            { id: 'c1', type: 'paragraph', data: { text: 'First content' }, meta: { tabId: 0 } },
            { id: 'c2', type: 'paragraph', data: { text: 'Second content' }, meta: { tabId: 1 } },
          ],
        }}
      />
    );

    expect(screen.getByText('First content')).toBeInTheDocument();
    expect(screen.queryByText('Second content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Second' }));

    expect(screen.getByText('Second content')).toBeInTheDocument();
    expect(screen.queryByText('First content')).not.toBeInTheDocument();
  });

  it('renders nothing for an empty tab list', () => {
    const { container } = render(<TabsBlock block={{ id: 'b1', type: 'tabs', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
