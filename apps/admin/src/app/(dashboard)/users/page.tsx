import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function UsersPage() {
  return <ComingSoonPage title="Users" permissions={PERMISSIONS.USERS_MANAGE} />;
}
