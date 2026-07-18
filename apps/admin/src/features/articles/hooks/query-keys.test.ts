import { describe, expect, it } from 'vitest';
import { articlesKeys, categoryOptionsKeys, mediaOptionsKeys, tagOptionsKeys } from './query-keys';

describe('articlesKeys', () => {
  it('all/lists/details/detail come from the shared resourceKeys factory', () => {
    expect(articlesKeys.all).toEqual(['articles']);
    expect(articlesKeys.lists()).toEqual(['articles', 'list']);
    expect(articlesKeys.details()).toEqual(['articles', 'detail']);
    expect(articlesKeys.detail('a1')).toEqual(['articles', 'detail', 'a1']);
  });

  it('list() appends the filters object to the shared lists() key', () => {
    expect(articlesKeys.list({ status: 'DRAFT' })).toEqual(['articles', 'list', { status: 'DRAFT' }]);
  });

  it('revisions(id) is scoped per article', () => {
    expect(articlesKeys.revisions('a1')).toEqual(['articles', 'a1', 'revisions']);
  });
});

describe('selector keys', () => {
  it('categoryOptionsKeys.flat() is a stable key', () => {
    expect(categoryOptionsKeys.flat()).toEqual(['articles', 'category-options']);
  });

  it('tagOptionsKeys.list() is scoped per search term', () => {
    expect(tagOptionsKeys.list('news')).toEqual(['articles', 'tag-options', 'news']);
    expect(tagOptionsKeys.list()).toEqual(['articles', 'tag-options', '']);
  });

  it('mediaOptionsKeys.list() is scoped per search term', () => {
    expect(mediaOptionsKeys.list('cover')).toEqual(['articles', 'media-options', 'cover']);
  });
});
