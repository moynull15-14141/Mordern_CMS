import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { CommentPolicy, CommentPolicySubject } from '../../authorization/policies/comment.policy';

/**
 * Roles that may manage ANY comment, regardless of who wrote it — the
 * milestone brief's "Moderator, Administrator, Super Admin" ownership
 * tiers (Editor is deliberately NOT included; comment moderation is not an
 * editorial-content concern like Articles/Media/Categories, and the brief
 * names exactly these three broad roles plus the comment's own author).
 */
const BROAD_ROLES: readonly string[] = [
  SystemRole.SUPER_ADMIN,
  SystemRole.ADMINISTRATOR,
  SystemRole.MODERATOR,
];

/**
 * First concrete implementation of `CommentPolicy` (previously
 * interface-only per `38_RBAC_ARCHITECTURE.md`). `Comment.userId` already
 * references `User.id` directly (nullable — a guest/anonymous comment has
 * no `userId`), so no extension of the frozen `CommentPolicySubject` shape
 * was needed — see docs/49_COMMENTS_ARCHITECTURE.md "Ownership Rules". A
 * comment with `userId === null` can only ever be managed by a broad-role
 * actor, since there is no account to match against.
 */
export class CommentOwnershipPolicy implements CommentPolicy {
  constructor(private readonly actorUserId: string | null) {}

  private hasManageAccess(actorRoles: readonly string[], subject: CommentPolicySubject): boolean {
    if (BROAD_ROLES.some((role) => actorRoles.includes(role))) {
      return true;
    }
    return (
      this.actorUserId !== null && subject.userId !== null && subject.userId === this.actorUserId
    );
  }

  canUpdate(actorRoles: readonly string[], subject: CommentPolicySubject): boolean {
    return this.hasManageAccess(actorRoles, subject);
  }

  canDelete(actorRoles: readonly string[], subject: CommentPolicySubject): boolean {
    return this.hasManageAccess(actorRoles, subject);
  }
}
