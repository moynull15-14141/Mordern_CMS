import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { UploadPageContent } from '@/features/media';

export default function MediaUploadPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.MEDIA_UPLOAD}>
      <UploadPageContent />
    </PermissionRoute>
  );
}
