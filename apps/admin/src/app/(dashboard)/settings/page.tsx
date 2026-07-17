import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function SettingsPage() {
  return <ComingSoonPage title="Settings" permissions={PERMISSIONS.SETTINGS_MANAGE} />;
}
