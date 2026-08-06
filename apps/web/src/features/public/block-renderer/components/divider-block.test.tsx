import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { DividerBlock } from './divider-block';

describe('DividerBlock', () => {
  it('renders a horizontal rule', () => {
    const { container } = render(<DividerBlock />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });
});
