import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeBlockBlock } from './code-block-block';

describe('CodeBlockBlock', () => {
  it('renders the code with its language as a data attribute', () => {
    render(
      <CodeBlockBlock
        block={{
          id: 'b1',
          type: 'code-block',
          data: { code: 'const x = 1;', language: 'typescript' },
        }}
      />
    );
    const pre = screen.getByText('const x = 1;').closest('pre');
    expect(pre).toHaveAttribute('data-language', 'typescript');
  });

  it('renders nothing when code is missing', () => {
    const { container } = render(
      <CodeBlockBlock block={{ id: 'b1', type: 'code-block', data: {} }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
