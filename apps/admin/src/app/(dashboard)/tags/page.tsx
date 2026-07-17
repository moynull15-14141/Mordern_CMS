import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function TagsPage() {
  return <ComingSoonPage title="Tags" permissions={PERMISSIONS.CATEGORY_CREATE} />;
}
