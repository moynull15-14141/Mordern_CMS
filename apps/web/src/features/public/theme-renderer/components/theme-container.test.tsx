import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeContainer } from './theme-container';

describe('ThemeContainer', () => {
  it('applies the container-page class by default', () => {
    const { container } = render(<ThemeContainer>content</ThemeContainer>);
    expect(container.firstElementChild).toHaveClass('container-page');
  });

  it('omits container-page when fullWidth is set', () => {
    const { container } = render(<ThemeContainer fullWidth>content</ThemeContainer>);
    expect(container.firstElementChild).not.toHaveClass('container-page');
  });

  it('appends a custom className alongside the base classes', () => {
    const { container } = render(<ThemeContainer className="my-extra">content</ThemeContainer>);
    expect(container.firstElementChild).toHaveClass('my-extra');
    expect(container.firstElementChild).toHaveClass('container-page');
  });
});
