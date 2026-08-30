import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreateRedirectPageContent } from '@/features/redirects';

export default function NewRedirectPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <CreateRedirectPageContent />
    </PermissionRoute>
  );
}
