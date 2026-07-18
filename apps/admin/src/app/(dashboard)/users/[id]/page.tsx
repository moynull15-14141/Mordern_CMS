import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { UserDetailPageContent } from '@/features/users';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.USERS_MANAGE}>
      <UserDetailPageContent userId={id} />
    </PermissionRoute>
  );
}
