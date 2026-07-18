import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditCategoryPageContent } from '@/features/categories';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.CATEGORY_CREATE}>
      <EditCategoryPageContent categoryId={id} />
    </PermissionRoute>
  );
}
