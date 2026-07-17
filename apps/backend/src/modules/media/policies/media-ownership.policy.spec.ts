import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { MediaOwnershipPolicy } from './media-ownership.policy';

describe('MediaOwnershipPolicy', () => {
  const subject = { uploadedBy: 'user-1' };

  describe('canUpdate', () => {
    it('allows Super Admin regardless of ownership', () => {
      const policy = new MediaOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.SUPER_ADMIN], subject)).toBe(true);
    });

    it('allows Administrator regardless of ownership', () => {
      const policy = new MediaOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.ADMINISTRATOR], subject)).toBe(true);
    });

    it('allows Editor regardless of ownership', () => {
      const policy = new MediaOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.EDITOR], subject)).toBe(true);
    });

    it('allows Author who uploaded the asset', () => {
      const policy = new MediaOwnershipPolicy('user-1');
      expect(policy.canUpdate([SystemRole.AUTHOR], subject)).toBe(true);
    });

    it('allows Contributor who uploaded the asset', () => {
      const policy = new MediaOwnershipPolicy('user-1');
      expect(policy.canUpdate([SystemRole.CONTRIBUTOR], subject)).toBe(true);
    });

    it('denies Author who did not upload the asset', () => {
      const policy = new MediaOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.AUTHOR], subject)).toBe(false);
    });

    it('denies a role with no manage rights and no ownership', () => {
      const policy = new MediaOwnershipPolicy('someone-else');
      expect(policy.canUpdate([SystemRole.SUBSCRIBER], subject)).toBe(false);
    });

    it('denies when actorUserId is null', () => {
      const policy = new MediaOwnershipPolicy(null);
      expect(policy.canUpdate([SystemRole.AUTHOR], subject)).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('mirrors canUpdate rules', () => {
      const ownerPolicy = new MediaOwnershipPolicy('user-1');
      const strangerPolicy = new MediaOwnershipPolicy('someone-else');
      expect(ownerPolicy.canDelete([SystemRole.AUTHOR], subject)).toBe(true);
      expect(strangerPolicy.canDelete([SystemRole.AUTHOR], subject)).toBe(false);
      expect(strangerPolicy.canDelete([SystemRole.EDITOR], subject)).toBe(true);
    });
  });
});
