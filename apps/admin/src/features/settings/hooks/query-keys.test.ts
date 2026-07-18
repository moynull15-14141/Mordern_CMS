import { describe, expect, it } from 'vitest';
import { settingsKeys } from './query-keys';

describe('settingsKeys', () => {
  it('all/lists come from the shared resourceKeys factory', () => {
    expect(settingsKeys.all).toEqual(['settings']);
    expect(settingsKeys.lists()).toEqual(['settings', 'list']);
  });

  it('categories()/category() are scoped per category', () => {
    expect(settingsKeys.categories()).toEqual(['settings', 'category']);
    expect(settingsKeys.category('seo')).toEqual(['settings', 'category', 'seo']);
    expect(settingsKeys.category('general')).toEqual(['settings', 'category', 'general']);
  });

  it('keys()/key() are scoped per setting key', () => {
    expect(settingsKeys.keys()).toEqual(['settings', 'key']);
    expect(settingsKeys.key('general.siteName')).toEqual(['settings', 'key', 'general.siteName']);
  });
});
