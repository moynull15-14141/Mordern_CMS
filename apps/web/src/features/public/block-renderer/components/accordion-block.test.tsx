import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccordionBlock } from './accordion-block';

describe('AccordionBlock', () => {
  it('renders one native <details> panel per data.panels entry, with grouped children', () => {
    const { container } = render(
      <AccordionBlock
        block={{
          id: 'b1',
          type: 'accordion',
          data: { panels: [{ title: 'Panel one' }, { title: 'Panel two' }] },
          children: [
            { id: 'c1', type: 'paragraph', data: { text: 'Content one' }, meta: { panelId: 0 } },
            { id: 'c2', type: 'paragraph', data: { text: 'Content two' }, meta: { panelId: 1 } },
          ],
        }}
      />
    );
    expect(container.querySelectorAll('details')).toHaveLength(2);
    expect(screen.getByText('Panel one')).toBeInTheDocument();
    expect(screen.getByText('Content one')).toBeInTheDocument();
    expect(screen.getByText('Content two')).toBeInTheDocument();
  });

  it('renders nothing for an empty panel list', () => {
    const { container } = render(
      <AccordionBlock block={{ id: 'b1', type: 'accordion', data: {} }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
