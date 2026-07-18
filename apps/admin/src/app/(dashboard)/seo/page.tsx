import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { SeoIntelligenceCenter } from '@/features/seo/components/seo-intelligence-center';

export default function SeoPage() {
  return (
    <PermissionRoute permissions={[PERMISSIONS.SEO_MANAGE]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">SEO Intelligence Center</h1>
          <p className="text-sm text-muted-foreground">
            Real-time SEO score, previews, and structured data for your articles and categories.
          </p>
        </div>
        <SeoIntelligenceCenter />
      </div>
    </PermissionRoute>
  );
}
