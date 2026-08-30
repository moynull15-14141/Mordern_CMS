import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditRedirectPageContent } from '@/features/redirects';

export default async function EditRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <EditRedirectPageContent redirectId={id} />
    </PermissionRoute>
  );
}
