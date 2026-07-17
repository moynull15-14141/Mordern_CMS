'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Settings Provider — Frontend Milestone 1 infrastructure placeholder
 * ONLY. Does NOT call the backend's `/settings` endpoints (that would be
 * both an API call and the Settings feature module, both explicitly out of
 * scope this milestone). Reserved as the future integration point for
 * SettingCategory-driven app-shell configuration (e.g. General.siteName)
 * once a Settings feature module is built — see
 * docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Future Integration". For now it
 * only holds genuinely client-local display preferences (table density)
 * with no server representation.
 */
export interface AppDisplaySettings {
  tableDensity: 'comfortable' | 'compact';
}

interface SettingsContextValue {
  settings: AppDisplaySettings;
  setTableDensity: (density: AppDisplaySettings['tableDensity']) => void;
}

const DEFAULT_SETTINGS: AppDisplaySettings = { tableDensity: 'comfortable' };

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppDisplaySettings>(DEFAULT_SETTINGS);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setTableDensity: (tableDensity) => setSettings((prev) => ({ ...prev, tableDensity })),
    }),
    [settings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useAppSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useAppSettings() must be used within a <SettingsProvider>.');
  }
  return context;
}
