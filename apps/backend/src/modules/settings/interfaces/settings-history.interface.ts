import { SettingValue } from './setting-value.type';

export interface SettingHistoryEntry {
  settingKey: string;
  previousValue: SettingValue;
  newValue: SettingValue;
  changedBy: string | null;
  changedAt: Date;
}

/**
 * Future audit/history/rollback tier for setting changes. Interface only —
 * no `setting_history` table exists and none is added by this milestone (the
 * frozen schema is not modified). No implementation or DI provider is
 * registered; `SettingsService` does not call this today.
 */
export interface SettingsHistoryInterface {
  record(entry: SettingHistoryEntry): Promise<void>;
  getHistory(settingKey: string, limit?: number): Promise<SettingHistoryEntry[]>;
  rollback(settingKey: string, toVersion: number): Promise<void>;
}
