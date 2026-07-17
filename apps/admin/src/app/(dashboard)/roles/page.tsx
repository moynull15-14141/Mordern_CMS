import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function RolesPage() {
  return <ComingSoonPage title="Roles & Permissions" permissions={PERMISSIONS.ROLES_MANAGE} />;
}
