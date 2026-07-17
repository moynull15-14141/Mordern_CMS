import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { CommentOwnershipPolicy } from './comment-ownership.policy';

describe('CommentOwnershipPolicy', () => {
  describe('canUpdate', () => {
    it('allows the comment owner', () => {
      const policy = new CommentOwnershipPolicy('user-1');
      expect(policy.canUpdate([SystemRole.SUBSCRIBER], { userId: 'user-1' })).toBe(true);
    });

    it('denies a different user with no broad role', () => {
      const policy = new CommentOwnershipPolicy('user-2');
      expect(policy.canUpdate([SystemRole.SUBSCRIBER], { userId: 'user-1' })).toBe(false);
    });

    it('allows Moderator regardless of ownership', () => {
      const policy = new CommentOwnershipPolicy('user-2');
      expect(policy.canUpdate([SystemRole.MODERATOR], { userId: 'user-1' })).toBe(true);
    });

    it('allows Administrator regardless of ownership', () => {
      const policy = new CommentOwnershipPolicy('user-2');
      expect(policy.canUpdate([SystemRole.ADMINISTRATOR], { userId: 'user-1' })).toBe(true);
    });

    it('allows Super Admin regardless of ownership', () => {
      const policy = new CommentOwnershipPolicy('user-2');
      expect(policy.canUpdate([SystemRole.SUPER_ADMIN], { userId: 'user-1' })).toBe(true);
    });

    it('denies Editor (not a comment broad role) without ownership', () => {
      const policy = new CommentOwnershipPolicy('user-2');
      expect(policy.canUpdate([SystemRole.EDITOR], { userId: 'user-1' })).toBe(false);
    });

    it('denies a null actor against a null-owner (guest) comment', () => {
      const policy = new CommentOwnershipPolicy(null);
      expect(policy.canUpdate([SystemRole.SUBSCRIBER], { userId: null })).toBe(false);
    });

    it('allows a broad role against a null-owner (guest) comment', () => {
      const policy = new CommentOwnershipPolicy('user-2');
      expect(policy.canUpdate([SystemRole.MODERATOR], { userId: null })).toBe(true);
    });
  });

  describe('canDelete', () => {
    it('allows the comment owner', () => {
      const policy = new CommentOwnershipPolicy('user-1');
      expect(policy.canDelete([SystemRole.SUBSCRIBER], { userId: 'user-1' })).toBe(true);
    });

    it('denies a different user with no broad role', () => {
      const policy = new CommentOwnershipPolicy('user-2');
      expect(policy.canDelete([SystemRole.SUBSCRIBER], { userId: 'user-1' })).toBe(false);
    });

    it('allows Moderator regardless of ownership', () => {
      const policy = new CommentOwnershipPolicy('user-2');
      expect(policy.canDelete([SystemRole.MODERATOR], { userId: 'user-1' })).toBe(true);
    });
  });
});
