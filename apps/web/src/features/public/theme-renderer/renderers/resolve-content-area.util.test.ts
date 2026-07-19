import { describe, expect, it } from 'vitest';
import { resolveContentArea } from './resolve-content-area.util';

describe('resolveContentArea', () => {
  it('maps "home" to area "home"', () => {
    expect(resolveContentArea('home')).toBe('home');
  });

  it('maps "article" and "blog-list" to area "blog"', () => {
    expect(resolveContentArea('article')).toBe('blog');
    expect(resolveContentArea('blog-list')).toBe('blog');
  });

  it('maps "page", "category", and "not-found" to area "default"', () => {
    expect(resolveContentArea('page')).toBe('default');
    expect(resolveContentArea('category')).toBe('default');
    expect(resolveContentArea('not-found')).toBe('default');
  });
});
