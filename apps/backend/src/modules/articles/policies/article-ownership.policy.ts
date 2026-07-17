import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { ArticlePolicy, ArticlePolicySubject } from '../../authorization/policies/article.policy';

/** Roles that may edit/delete ANY article, regardless of ownership. */
const BROAD_ROLES: readonly string[] = [
  SystemRole.SUPER_ADMIN,
  SystemRole.ADMINISTRATOR,
  SystemRole.EDITOR,
];

/** Roles that may edit/delete only their OWN articles. */
const OWNER_ONLY_ROLES: readonly string[] = [SystemRole.AUTHOR, SystemRole.CONTRIBUTOR];

/**
 * First concrete implementation of `ArticlePolicy` (previously interface-only
 * per `38_RBAC_ARCHITECTURE.md`). The frozen `Policy<TSubject>` contract is
 * `(actorRoles, subject) => boolean` — it has no third parameter for the
 * acting user's own identity, so ownership is carried via constructor
 * closure instead of a signature change (which would touch the shared,
 * frozen `policy.interface.ts` used by Media/Comment/Settings too — a much
 * larger change than necessary). The service constructs one instance per
 * request with the current user's id.
 */
export class ArticleOwnershipPolicy implements ArticlePolicy {
  constructor(private readonly actorUserId: string | null) {}

  private isOwnerOfSubject(subject: ArticlePolicySubject): boolean {
    return this.actorUserId !== null && subject.authorUserId === this.actorUserId;
  }

  private hasEditAccess(actorRoles: readonly string[], subject: ArticlePolicySubject): boolean {
    if (BROAD_ROLES.some((role) => actorRoles.includes(role))) {
      return true;
    }
    const isOwnerRole = OWNER_ONLY_ROLES.some((role) => actorRoles.includes(role));
    return isOwnerRole && this.isOwnerOfSubject(subject);
  }

  canUpdate(actorRoles: readonly string[], subject: ArticlePolicySubject): boolean {
    return this.hasEditAccess(actorRoles, subject);
  }

  canDelete(actorRoles: readonly string[], subject: ArticlePolicySubject): boolean {
    return this.hasEditAccess(actorRoles, subject);
  }
}
