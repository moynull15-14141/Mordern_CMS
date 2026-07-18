'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SYSTEM_ROLES } from '@/constants/permissions';
import { USER_STATUS_OPTIONS } from '../constants/user.constants';
import type { UserStatus } from '../types/user';

export interface UserFiltersValue {
  status?: UserStatus;
  role?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface UserFiltersProps {
  value: UserFiltersValue;
  onChange: (value: UserFiltersValue) => void;
}

const ALL_VALUE = '__all__';

/**
 * Status filter maps directly onto the real `UserStatus` enum via
 * `GET /users?status=`. Role filter is a real backend capability
 * (`UserQueryDto.role`, free-text match against a role NAME) even though
 * roles cannot be displayed or assigned anywhere in this milestone — see
 * docs/63_FRONTEND_USERS.md "Roles". Options come from the frozen
 * `SYSTEM_ROLES` list (`38_RBAC_ARCHITECTURE.md`), not a live roles
 * endpoint (none exists).
 */
export function UserFilters({ value, onChange }: UserFiltersProps) {
  const hasActiveFilters = Boolean(value.status || value.role || value.createdFrom || value.createdTo);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="user-filter-status">Status</Label>
        <Select
          value={value.status ?? ALL_VALUE}
          onValueChange={(next) => onChange({ ...value, status: next === ALL_VALUE ? undefined : (next as UserStatus) })}
        >
          <SelectTrigger id="user-filter-status" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {USER_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="user-filter-role">Role</Label>
        <Select
          value={value.role ?? ALL_VALUE}
          onValueChange={(next) => onChange({ ...value, role: next === ALL_VALUE ? undefined : next })}
        >
          <SelectTrigger id="user-filter-role" className="w-44">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All roles</SelectItem>
            {Object.values(SYSTEM_ROLES).map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="user-filter-created-from">Created from</Label>
        <Input
          id="user-filter-created-from"
          type="date"
          className="w-40"
          value={value.createdFrom ?? ''}
          onChange={(event) => onChange({ ...value, createdFrom: event.target.value || undefined })}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="user-filter-created-to">Created to</Label>
        <Input
          id="user-filter-created-to"
          type="date"
          className="w-40"
          value={value.createdTo ?? ''}
          onChange={(event) => onChange({ ...value, createdTo: event.target.value || undefined })}
        />
      </div>

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
