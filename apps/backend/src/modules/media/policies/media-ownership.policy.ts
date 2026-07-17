import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { MediaPolicy, MediaPolicySubject } from '../../authorization/policies/media.policy';

/** Roles that may manage ANY media asset, regardless of who uploaded it. */
const BROAD_ROLES: readonly string[] = [
  SystemRole.SUPER_ADMIN,
  SystemRole.ADMINISTRATOR,
  SystemRole.EDITOR,
];

/** Roles that may manage only media they uploaded themselves. */
const OWNER_ONLY_ROLES: readonly string[] = [SystemRole.AUTHOR, SystemRole.CONTRIBUTOR];

/**
 * First concrete implementation of `MediaPolicy` (previously interface-only
 * per `38_RBAC_ARCHITECTURE.md`). Unlike Articles, `MediaAsset.uploadedBy`
 * already references `User.id` directly (no `Author` indirection), so no
 * extension of the frozen `MediaPolicySubject` shape was needed — see
 * docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Permission Flow". Role tiers mirror
 * `ArticleOwnershipPolicy` (Milestone 8) for consistency.
 */
export class MediaOwnershipPolicy implements MediaPolicy {
  constructor(private readonly actorUserId: string | null) {}

  private hasManageAccess(actorRoles: readonly string[], subject: MediaPolicySubject): boolean {
    if (BROAD_ROLES.some((role) => actorRoles.includes(role))) {
      return true;
    }
    const isOwnerRole = OWNER_ONLY_ROLES.some((role) => actorRoles.includes(role));
    const isOwner = this.actorUserId !== null && subject.uploadedBy === this.actorUserId;
    return isOwnerRole && isOwner;
  }

  canUpdate(actorRoles: readonly string[], subject: MediaPolicySubject): boolean {
    return this.hasManageAccess(actorRoles, subject);
  }

  canDelete(actorRoles: readonly string[], subject: MediaPolicySubject): boolean {
    return this.hasManageAccess(actorRoles, subject);
  }
}
