'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { SETTINGS_ROUTES } from '@/constants/routes';
import { useSettings } from '../hooks/use-settings';
import { useResetAll } from '../hooks/use-reset-all';
import { SettingsTable } from './settings-table';
import { SettingsFilters } from './settings-filters';
import { SettingDetailsDialog } from './setting-details-dialog';
import { ResetAllDialog } from './reset-all-dialog';
import type { Setting, SettingCategory } from '../types/settings';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Settings overview — `GET /settings` returns the complete, unpaginated
 * 34-entry catalog with no search/filter/sort query params
 * (docs/64_FRONTEND_SETTINGS.md "Conflicts Discovered"). Unlike
 * `UsersPageContent`, search/category-filter/sort/pagination all happen
 * client-side over that one fetched array — page/sort/filter/search state
 * still lives in the URL (shareable/bookmarkable), matching the
 * established state-management convention even though nothing here is a
 * server request. "Edit" always routes to that setting's category page
 * (`/settings/[category]`) — there is no single-setting edit surface.
 */
export function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = searchParams.get('sortBy') ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const category = (searchParams.get('category') as SettingCategory | null) ?? undefined;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      router.push(`?${next.toString()}`);
    },
    [router, searchParams],
  );

  const { data: allSettings, isLoading, error, refetch } = useSettings();
  const resetAllMutation = useResetAll();

  const [settingToView, setSettingToView] = useState<Setting | null>(null);
  const [resetAllConfirmOpen, setResetAllConfirmOpen] = useState(false);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder],
  );

  const filtered = useMemo(() => {
    let result = allSettings ?? [];

    if (category) {
      result = result.filter((setting) => setting.category === category);
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (setting) => setting.key.toLowerCase().includes(term) || setting.label.toLowerCase().includes(term),
      );
    }

    if (sortBy === 'label' || sortBy === 'category' || sortBy === 'type') {
      const sorted = [...result].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
      result = sortOrder === 'desc' ? sorted.reverse() : sorted;
    }

    return result;
  }, [allSettings, category, search, sortBy, sortOrder]);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);
  const pagination = {
    page,
    limit,
    total,
    hasNext: start + limit < total,
    hasPrevious: page > 1,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Browse and edit every platform setting, grouped by category."
        actions={
          <PermissionGate permissions={PERMISSIONS.SETTINGS_MANAGE}>
            <Button variant="outline" onClick={() => setResetAllConfirmOpen(true)}>
              Reset all settings
            </Button>
          </PermissionGate>
        }
      />

      <SettingsTable
        data={paged}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        pagination={pagination}
        onPageChange={(next) => updateParams({ page: String(next) })}
        onLimitChange={(next) => updateParams({ limit: String(next), page: '1' })}
        sorting={sorting}
        onSortingChange={(next) => {
          const first = next[0];
          updateParams({ sortBy: first?.id, sortOrder: first ? (first.desc ? 'desc' : 'asc') : undefined });
        }}
        search={search}
        onSearchChange={(next) => updateParams({ search: next, page: '1' })}
        filters={
          <SettingsFilters
            value={{ category }}
            onChange={(next) => updateParams({ category: next.category, page: '1' })}
          />
        }
        onView={setSettingToView}
        onEdit={(setting) => router.push(SETTINGS_ROUTES.category(setting.category))}
      />

      <SettingDetailsDialog
        open={Boolean(settingToView)}
        onOpenChange={(open) => !open && setSettingToView(null)}
        setting={settingToView}
      />

      <ResetAllDialog
        open={resetAllConfirmOpen}
        onOpenChange={setResetAllConfirmOpen}
        onConfirm={() => resetAllMutation.mutate()}
      />
    </div>
  );
}
