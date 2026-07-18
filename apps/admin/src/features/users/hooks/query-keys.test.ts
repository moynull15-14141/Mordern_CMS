import { describe, expect, it } from 'vitest';
import { usersKeys } from './query-keys';

describe('usersKeys', () => {
  it('all/lists/details/detail come from the shared resourceKeys factory', () => {
    expect(usersKeys.all).toEqual(['users']);
    expect(usersKeys.lists()).toEqual(['users', 'list']);
    expect(usersKeys.details()).toEqual(['users', 'detail']);
    expect(usersKeys.detail('u1')).toEqual(['users', 'detail', 'u1']);
  });

  it('list() appends the filters object to the shared lists() key', () => {
    expect(usersKeys.list({ status: 'ACTIVE' })).toEqual(['users', 'list', { status: 'ACTIVE' }]);
  });

  it('me() is a stable, filter-independent key', () => {
    expect(usersKeys.me()).toEqual(['users', 'me']);
  });

  it('sessions(userId) is scoped per user', () => {
    expect(usersKeys.sessions('u1')).toEqual(['users', 'u1', 'sessions']);
    expect(usersKeys.sessions('u2')).toEqual(['users', 'u2', 'sessions']);
  });
});
