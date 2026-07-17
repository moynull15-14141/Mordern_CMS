/**
 * Maps directly onto the existing nullable `Setting.siteId`/`Setting.tenantId`
 * columns (`36_DATABASE_FREEZE.md`) — architecture only, no multi-tenancy
 * behavior implemented. GLOBAL means both columns are null.
 */
export enum SettingScope {
  GLOBAL = 'GLOBAL',
  SITE = 'SITE',
  TENANT = 'TENANT',
}

export interface SettingScopeContext {
  scope: SettingScope;
  siteId?: string | null;
  tenantId?: string | null;
}

export const GLOBAL_SCOPE: SettingScopeContext = { scope: SettingScope.GLOBAL };
