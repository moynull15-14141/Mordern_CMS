import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CategoryDetailPageContent } from '@/features/categories';

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.CATEGORY_CREATE}>
      <CategoryDetailPageContent categoryId={id} />
    </PermissionRoute>
  );
}
