import { ArticlePolicy, ArticlePolicySubject } from './article.policy';
import { CommentPolicy } from './comment.policy';
import { MediaPolicy } from './media.policy';
import { Policy } from './policy.interface';
import { SettingsPolicy } from './settings.policy';

/**
 * Foundation-only shape tests: confirms the Policy contract and its 4 named
 * specializations compile and can be satisfied by a concrete object, with
 * NO business logic asserted (there isn't any yet — this milestone only
 * freezes the interfaces).
 */
describe('Policy foundation', () => {
  it('a generic Policy<T> can be implemented with any subset of the optional methods', () => {
    const policy: Policy<{ id: string }> = {
      canView: (roles) => roles.length > 0,
    };
    expect(policy.canView?.(['Editor'], { id: 'x' })).toBe(true);
    expect(policy.canCreate).toBeUndefined();
  });

  it('ArticlePolicy is satisfiable with an authorId-shaped subject', () => {
    const policy: ArticlePolicy = {
      canUpdate: (_roles, subject: ArticlePolicySubject) => subject.authorId === 'author-1',
    };
    expect(policy.canUpdate?.([], { authorId: 'author-1' })).toBe(true);
  });

  it('MediaPolicy, CommentPolicy, and SettingsPolicy all satisfy the base Policy contract', () => {
    const media: MediaPolicy = {};
    const comment: CommentPolicy = {};
    const settings: SettingsPolicy = {};
    expect(media).toEqual({});
    expect(comment).toEqual({});
    expect(settings).toEqual({});
  });
});
