import { describe, expect, it } from 'vitest';
import { ARTICLE_ROUTES, CATEGORY_ROUTES, MEDIA_ROUTES, PROFILE_ROUTES, ROUTES, TAG_ROUTES, USER_ROUTES } from './routes';

describe('USER_ROUTES (Frontend Milestone 3)', () => {
  it('new() builds /users/new', () => {
    expect(USER_ROUTES.new()).toBe('/users/new');
  });

  it('detail(id) builds /users/:id', () => {
    expect(USER_ROUTES.detail('u1')).toBe('/users/u1');
  });

  it('edit(id) builds /users/:id/edit', () => {
    expect(USER_ROUTES.edit('u1')).toBe('/users/u1/edit');
  });

  it('is built from the same ROUTES.USERS constant, not a hardcoded string', () => {
    expect(USER_ROUTES.detail('u1').startsWith(ROUTES.USERS)).toBe(true);
  });
});

describe('PROFILE_ROUTES (Frontend Milestone 3)', () => {
  it('edit() builds /profile/edit', () => {
    expect(PROFILE_ROUTES.edit()).toBe('/profile/edit');
  });

  it('changePassword() builds /profile/change-password', () => {
    expect(PROFILE_ROUTES.changePassword()).toBe('/profile/change-password');
  });
});

describe('ARTICLE_ROUTES (Frontend Milestone 5)', () => {
  it('new() builds /articles/new', () => {
    expect(ARTICLE_ROUTES.new()).toBe('/articles/new');
  });

  it('detail(id) builds /articles/:id', () => {
    expect(ARTICLE_ROUTES.detail('a1')).toBe('/articles/a1');
  });

  it('edit(id) builds /articles/:id/edit', () => {
    expect(ARTICLE_ROUTES.edit('a1')).toBe('/articles/a1/edit');
  });
});

describe('CATEGORY_ROUTES (Frontend Milestone 6)', () => {
  it('new() builds /categories/new', () => {
    expect(CATEGORY_ROUTES.new()).toBe('/categories/new');
  });

  it('detail(id) builds /categories/:id', () => {
    expect(CATEGORY_ROUTES.detail('c1')).toBe('/categories/c1');
  });

  it('edit(id) builds /categories/:id/edit', () => {
    expect(CATEGORY_ROUTES.edit('c1')).toBe('/categories/c1/edit');
  });
});

describe('TAG_ROUTES (Frontend Milestone 6)', () => {
  it('new() builds /tags/new', () => {
    expect(TAG_ROUTES.new()).toBe('/tags/new');
  });

  it('detail(id) builds /tags/:id', () => {
    expect(TAG_ROUTES.detail('t1')).toBe('/tags/t1');
  });

  it('edit(id) builds /tags/:id/edit', () => {
    expect(TAG_ROUTES.edit('t1')).toBe('/tags/t1/edit');
  });
});

describe('MEDIA_ROUTES (Frontend Milestone 7)', () => {
  it('upload() builds /media/upload', () => {
    expect(MEDIA_ROUTES.upload()).toBe('/media/upload');
  });

  it('detail(id) builds /media/:id', () => {
    expect(MEDIA_ROUTES.detail('m1')).toBe('/media/m1');
  });
});
