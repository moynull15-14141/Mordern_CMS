import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditUserPageContent } from '@/features/users';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.USERS_MANAGE}>
      <EditUserPageContent userId={id} />
    </PermissionRoute>
  );
}
