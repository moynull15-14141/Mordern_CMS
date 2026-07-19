import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeTitle } from './theme-title';

describe('ThemeTitle', () => {
  it('defaults to an h2', () => {
    render(<ThemeTitle>Title text</ThemeTitle>);
    expect(screen.getByText('Title text').tagName).toBe('H2');
  });

  it.each([1, 2, 3, 4] as const)('renders an h%s tag for level %s', (level) => {
    render(<ThemeTitle level={level}>Level {level}</ThemeTitle>);
    expect(screen.getByText(`Level ${level}`).tagName).toBe(`H${level}`);
  });
});
