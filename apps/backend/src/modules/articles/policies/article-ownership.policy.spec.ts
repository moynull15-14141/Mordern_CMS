import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { ArticleOwnershipPolicy } from './article-ownership.policy';

describe('ArticleOwnershipPolicy', () => {
  const subject = { authorId: 'author-1', authorUserId: 'user-1' };

  describe('canUpdate', () => {
    it('allows Super Admin regardless of ownership', () => {
      const policy = new ArticleOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.SUPER_ADMIN], subject)).toBe(true);
    });

    it('allows Administrator regardless of ownership', () => {
      const policy = new ArticleOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.ADMINISTRATOR], subject)).toBe(true);
    });

    it('allows Editor regardless of ownership', () => {
      const policy = new ArticleOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.EDITOR], subject)).toBe(true);
    });

    it('allows Author who owns the article', () => {
      const policy = new ArticleOwnershipPolicy('user-1');
      expect(policy.canUpdate([SystemRole.AUTHOR], subject)).toBe(true);
    });

    it('allows Contributor who owns the article', () => {
      const policy = new ArticleOwnershipPolicy('user-1');
      expect(policy.canUpdate([SystemRole.CONTRIBUTOR], subject)).toBe(true);
    });

    it('denies Author who does not own the article', () => {
      const policy = new ArticleOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.AUTHOR], subject)).toBe(false);
    });

    it('denies a role with no edit rights and no ownership', () => {
      const policy = new ArticleOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.SUBSCRIBER], subject)).toBe(false);
    });

    it('denies when the article has no linked user (authorUserId null) even for the Author role', () => {
      const policy = new ArticleOwnershipPolicy('user-1');
      expect(
        policy.canUpdate([SystemRole.AUTHOR], { authorId: 'author-1', authorUserId: null })
      ).toBe(false);
    });

    it('denies when actorUserId is null', () => {
      const policy = new ArticleOwnershipPolicy(null);
      expect(policy.canUpdate([SystemRole.AUTHOR], subject)).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('mirrors canUpdate rules', () => {
      const ownerPolicy = new ArticleOwnershipPolicy('user-1');
      const strangerPolicy = new ArticleOwnershipPolicy('someone-else');
      expect(ownerPolicy.canDelete([SystemRole.AUTHOR], subject)).toBe(true);
      expect(strangerPolicy.canDelete([SystemRole.AUTHOR], subject)).toBe(false);
      expect(strangerPolicy.canDelete([SystemRole.EDITOR], subject)).toBe(true);
    });
  });
});
