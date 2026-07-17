'use client';

import { FilePlus, FolderPlus, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { toast } from '@/lib/toast';
import { PERMISSIONS } from '@/constants/permissions';

const ACTIONS = [
  { label: 'New Article', icon: FilePlus, permission: PERMISSIONS.ARTICLE_CREATE },
  { label: 'New Category', icon: FolderPlus, permission: PERMISSIONS.CATEGORY_CREATE },
  { label: 'New User', icon: UserPlus, permission: PERMISSIONS.USERS_MANAGE },
] as const;

/** Quick Actions — Frontend Milestone 2 Dashboard Home scope. Every action
 * is permission-gated (Component Guard) but resolves to a "Coming soon"
 * notice rather than a real create flow — the underlying feature modules
 * (Articles, Categories, Users) aren't built until a later milestone. */
export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {ACTIONS.map(({ label, icon: Icon, permission }) => (
          <PermissionGate key={label} permissions={permission}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Coming soon', `${label} isn't available yet.`)}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Button>
          </PermissionGate>
        ))}
      </CardContent>
    </Card>
  );
}
