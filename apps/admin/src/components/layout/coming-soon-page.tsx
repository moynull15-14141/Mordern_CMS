import type { ReactNode } from 'react';
import { PermissionRoute } from '@/components/guards/permission-route';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/containers';
import { ComingSoon } from '@/components/feedback/coming-soon';
import type { PermissionKey } from '@/constants/permissions';

export interface ComingSoonPageProps {
  title: string;
  /** Omit for a page that's authenticated-only (matches
   * docs/60_ADMIN_NAVIGATION.md's nav items with no listed permission,
   * e.g. Comments, Profile). */
  permissions?: PermissionKey | PermissionKey[];
  requireAll?: boolean;
}

/**
 * Thin page-level composition for every nav-manifest route without a
 * shipped feature module yet — keeps every `app/(dashboard)/*\/page.tsx`
 * file itself free of business logic (docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Best Practices"), while still exercising the real Route Guard
 * (PermissionRoute) each route is specified to have.
 */
export function ComingSoonPage({ title, permissions, requireAll }: ComingSoonPageProps): ReactNode {
  const content = (
    <ContentContainer>
      <PageHeader title={title} />
      <ComingSoon title={title} />
    </ContentContainer>
  );

  if (!permissions) return content;

  return (
    <PermissionRoute permissions={permissions} requireAll={requireAll}>
      {content}
    </PermissionRoute>
  );
}
