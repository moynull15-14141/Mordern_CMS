import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { MediaDetailPageContent } from '@/features/media';

export default async function MediaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={[PERMISSIONS.MEDIA_UPLOAD, PERMISSIONS.MEDIA_DELETE]}>
      <MediaDetailPageContent mediaId={id} />
    </PermissionRoute>
  );
}
