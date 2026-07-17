import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function MediaPage() {
  return (
    <ComingSoonPage
      title="Media Library"
      permissions={[PERMISSIONS.MEDIA_UPLOAD, PERMISSIONS.MEDIA_DELETE]}
    />
  );
}
