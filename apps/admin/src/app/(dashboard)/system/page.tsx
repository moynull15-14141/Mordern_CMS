import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function SystemPage() {
  return <ComingSoonPage title="System" permissions={PERMISSIONS.SYSTEM_MANAGE} />;
}
