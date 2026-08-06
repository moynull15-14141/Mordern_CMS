import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { ReusableBlockDetailPageContent } from '@/features/reusable-blocks';

export default async function ReusableBlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <ReusableBlockDetailPageContent blockId={id} />
    </PermissionRoute>
  );
}
