import { describe, expect, it } from 'vitest';
import { API_ENDPOINTS } from './api-endpoints';

describe('API_ENDPOINTS', () => {
  it('every AUTH path starts with /auth', () => {
    Object.values(API_ENDPOINTS.AUTH).forEach((path) => {
      expect(path.startsWith('/auth')).toBe(true);
    });
  });

  it('every top-level string endpoint starts with a leading slash', () => {
    const stringEndpoints = Object.values(API_ENDPOINTS).filter(
      (value) => typeof value === 'string'
    ) as string[];
    stringEndpoints.forEach((path) => {
      expect(path.startsWith('/')).toBe(true);
    });
  });

  it('exposes the authorization/me endpoint used by the Auth Provider', () => {
    expect(API_ENDPOINTS.AUTHORIZATION.ME).toBe('/authorization/me');
  });

  it('has no trailing slashes on any endpoint', () => {
    expect(API_ENDPOINTS.ARTICLES.ROOT.endsWith('/')).toBe(false);
    expect(API_ENDPOINTS.AUTH.LOGIN.endsWith('/')).toBe(false);
  });

  describe('ARTICLES (Frontend Milestone 5)', () => {
    it('exposes the real, verified endpoints only — matches ArticlesController exactly', () => {
      expect(API_ENDPOINTS.ARTICLES.ROOT).toBe('/articles');
      expect(API_ENDPOINTS.ARTICLES.bySlug('my-post')).toBe('/articles/slug/my-post');
      expect(API_ENDPOINTS.ARTICLES.byId('a1')).toBe('/articles/a1');
      expect(API_ENDPOINTS.ARTICLES.restore('a1')).toBe('/articles/a1/restore');
      expect(API_ENDPOINTS.ARTICLES.publish('a1')).toBe('/articles/a1/publish');
      expect(API_ENDPOINTS.ARTICLES.schedule('a1')).toBe('/articles/a1/schedule');
      expect(API_ENDPOINTS.ARTICLES.revisions('a1')).toBe('/articles/a1/revisions');
      expect(API_ENDPOINTS.ARTICLES.revisionsCompare('a1')).toBe('/articles/a1/revisions/compare');
      expect(API_ENDPOINTS.ARTICLES.restoreRevision('a1', 2)).toBe('/articles/a1/revisions/2/restore');
    });

    it('does not expose a bulk endpoint (no such capability exists on the backend)', () => {
      expect(API_ENDPOINTS.ARTICLES).not.toHaveProperty('bulk');
    });
  });

  describe('CATEGORIES (Frontend Milestones 5–6)', () => {
    it('exposes the real, verified endpoints only — matches CategoriesController exactly', () => {
      expect(API_ENDPOINTS.CATEGORIES.ROOT).toBe('/categories');
      expect(API_ENDPOINTS.CATEGORIES.TREE).toBe('/categories/tree');
      expect(API_ENDPOINTS.CATEGORIES.FLAT).toBe('/categories/flat');
      expect(API_ENDPOINTS.CATEGORIES.bySlug('news')).toBe('/categories/slug/news');
      expect(API_ENDPOINTS.CATEGORIES.byId('c1')).toBe('/categories/c1');
      expect(API_ENDPOINTS.CATEGORIES.move('c1')).toBe('/categories/c1/move');
      expect(API_ENDPOINTS.CATEGORIES.restore('c1')).toBe('/categories/c1/restore');
      expect(API_ENDPOINTS.CATEGORIES.children('c1')).toBe('/categories/c1/children');
      expect(API_ENDPOINTS.CATEGORIES.descendants('c1')).toBe('/categories/c1/descendants');
      expect(API_ENDPOINTS.CATEGORIES.ancestors('c1')).toBe('/categories/c1/ancestors');
      expect(API_ENDPOINTS.CATEGORIES.breadcrumb('c1')).toBe('/categories/c1/breadcrumb');
    });
  });

  describe('TAGS (Frontend Milestone 6)', () => {
    it('exposes the real, verified endpoints only — matches TagsController exactly', () => {
      expect(API_ENDPOINTS.TAGS.ROOT).toBe('/tags');
      expect(API_ENDPOINTS.TAGS.bySlug('breaking')).toBe('/tags/slug/breaking');
      expect(API_ENDPOINTS.TAGS.byId('t1')).toBe('/tags/t1');
      expect(API_ENDPOINTS.TAGS.restore('t1')).toBe('/tags/t1/restore');
    });

    it('does not expose an SEO sub-path (TagResponseDto has no seo field)', () => {
      expect(API_ENDPOINTS.TAGS).not.toHaveProperty('seo');
    });
  });

  describe('USERS (Frontend Milestone 3)', () => {
    it('exposes the real, verified endpoints only — matches UsersController exactly', () => {
      expect(API_ENDPOINTS.USERS.ROOT).toBe('/users');
      expect(API_ENDPOINTS.USERS.ME).toBe('/users/me');
      expect(API_ENDPOINTS.USERS.ME_PROFILE).toBe('/users/me/profile');
      expect(API_ENDPOINTS.USERS.ME_PREFERENCES).toBe('/users/me/preferences');
      expect(API_ENDPOINTS.USERS.ME_AVATAR).toBe('/users/me/avatar');
    });

    it('builds id-scoped paths correctly', () => {
      expect(API_ENDPOINTS.USERS.byId('u1')).toBe('/users/u1');
      expect(API_ENDPOINTS.USERS.restore('u1')).toBe('/users/u1/restore');
      expect(API_ENDPOINTS.USERS.changePassword('u1')).toBe('/users/u1/change-password');
      expect(API_ENDPOINTS.USERS.resetPassword('u1')).toBe('/users/u1/reset-password');
      expect(API_ENDPOINTS.USERS.sessions('u1')).toBe('/users/u1/sessions');
      expect(API_ENDPOINTS.USERS.session('u1', 's1')).toBe('/users/u1/sessions/s1');
    });

    it('does not expose an endpoint for role assignment or /users/profile (no backend API exists)', () => {
      expect(API_ENDPOINTS.USERS).not.toHaveProperty('roles');
      expect(API_ENDPOINTS.USERS).not.toHaveProperty('PROFILE');
    });
  });

  describe('SETTINGS (Frontend Milestone 4)', () => {
    it('exposes the real, verified endpoints only — matches SettingsController exactly', () => {
      expect(API_ENDPOINTS.SETTINGS.ROOT).toBe('/settings');
      expect(API_ENDPOINTS.SETTINGS.EXPORT).toBe('/settings/export');
      expect(API_ENDPOINTS.SETTINGS.IMPORT).toBe('/settings/import');
      expect(API_ENDPOINTS.SETTINGS.RESET).toBe('/settings/reset');
      expect(API_ENDPOINTS.SETTINGS.RESET_CATEGORY).toBe('/settings/reset/category');
    });

    it('builds category/key-scoped paths correctly', () => {
      expect(API_ENDPOINTS.SETTINGS.byCategory('seo')).toBe('/settings/category/seo');
      expect(API_ENDPOINTS.SETTINGS.byKey('general.siteName')).toBe('/settings/general.siteName');
    });

    it('does not expose a create or delete endpoint (no such capability exists on the backend)', () => {
      expect(API_ENDPOINTS.SETTINGS).not.toHaveProperty('create');
      expect(API_ENDPOINTS.SETTINGS).not.toHaveProperty('delete');
      expect(API_ENDPOINTS.SETTINGS).not.toHaveProperty('remove');
    });
  });

  describe('MEDIA (Frontend Milestone 7)', () => {
    it('exposes the real, verified endpoints only — matches MediaController exactly', () => {
      expect(API_ENDPOINTS.MEDIA.ROOT).toBe('/media');
      expect(API_ENDPOINTS.MEDIA.byId('m1')).toBe('/media/m1');
      expect(API_ENDPOINTS.MEDIA.usages('m1')).toBe('/media/m1/usages');
      expect(API_ENDPOINTS.MEDIA.duplicates('m1')).toBe('/media/m1/duplicates');
      expect(API_ENDPOINTS.MEDIA.rename('m1')).toBe('/media/m1/rename');
      expect(API_ENDPOINTS.MEDIA.move('m1')).toBe('/media/m1/move');
      expect(API_ENDPOINTS.MEDIA.copyMetadata('m1')).toBe('/media/m1/copy-metadata');
      expect(API_ENDPOINTS.MEDIA.restore('m1')).toBe('/media/m1/restore');
    });

    it('does not expose an upload/download/stream endpoint (no such capability exists on the backend)', () => {
      expect(API_ENDPOINTS.MEDIA).not.toHaveProperty('upload');
      expect(API_ENDPOINTS.MEDIA).not.toHaveProperty('download');
      expect(API_ENDPOINTS.MEDIA).not.toHaveProperty('stream');
    });

    it('exposes only the sub-path the folder filter/picker needs', () => {
      expect(API_ENDPOINTS.MEDIA_FOLDERS.ROOT).toBe('/media-folders');
      expect(API_ENDPOINTS.MEDIA_FOLDERS.TREE).toBe('/media-folders/tree');
    });
  });
});
