import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { TaxonomyPolicy } from './taxonomy.policy';

describe('TaxonomyPolicy', () => {
  const policy = new TaxonomyPolicy();
  const subject = { siteId: 'site-1' };

  describe('canCreate', () => {
    it('allows Super Admin', () => {
      expect(policy.canCreate([SystemRole.SUPER_ADMIN])).toBe(true);
    });

    it('allows Administrator', () => {
      expect(policy.canCreate([SystemRole.ADMINISTRATOR])).toBe(true);
    });

    it('allows Editor', () => {
      expect(policy.canCreate([SystemRole.EDITOR])).toBe(true);
    });

    it('denies Author', () => {
      expect(policy.canCreate([SystemRole.AUTHOR])).toBe(false);
    });

    it('denies Contributor', () => {
      expect(policy.canCreate([SystemRole.CONTRIBUTOR])).toBe(false);
    });

    it('denies Subscriber', () => {
      expect(policy.canCreate([SystemRole.SUBSCRIBER])).toBe(false);
    });

    it('denies an empty role list', () => {
      expect(policy.canCreate([])).toBe(false);
    });
  });

  describe('canUpdate', () => {
    it('allows Editor', () => {
      expect(policy.canUpdate([SystemRole.EDITOR], subject)).toBe(true);
    });

    it('denies Author (no ownership concept for taxonomy)', () => {
      expect(policy.canUpdate([SystemRole.AUTHOR], subject)).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('allows Administrator', () => {
      expect(policy.canDelete([SystemRole.ADMINISTRATOR], subject)).toBe(true);
    });

    it('denies Moderator', () => {
      expect(policy.canDelete([SystemRole.MODERATOR], subject)).toBe(false);
    });
  });
});
